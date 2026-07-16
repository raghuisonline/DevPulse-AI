import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import type { Diagnosis, TelemetryInput, TenantIdentity } from "./schemas";

export class TelemetryStorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelemetryStorageConfigurationError";
  }
}

export type TelemetryLogRecord = {
  id: string;
  tenant: TenantIdentity;
  telemetry: TelemetryInput;
  receivedAt: string;
  analysisStatus: "queued" | "not_requested";
};

let prismaClient: PrismaClient | undefined;
let schemaInitialization: Promise<void> | undefined;

function databaseClient(): PrismaClient {
  if (prismaClient) return prismaClient;

  const url = process.env.LIBSQL_DATABASE_URL?.trim();
  const authToken = process.env.LIBSQL_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    throw new TelemetryStorageConfigurationError(
      "LIBSQL_DATABASE_URL and LIBSQL_AUTH_TOKEN must be configured.",
    );
  }

  let protocol: string;
  try {
    protocol = new URL(url).protocol;
  } catch {
    throw new TelemetryStorageConfigurationError(
      "LIBSQL_DATABASE_URL must be a valid remote database URL.",
    );
  }

  if (!["libsql:", "https:", "wss:"].includes(protocol)) {
    throw new TelemetryStorageConfigurationError(
      "LIBSQL_DATABASE_URL must use an encrypted libsql, https, or wss connection.",
    );
  }

  const adapter = new PrismaLibSql(
    {
      url,
      authToken,
      concurrency: 32,
      intMode: "number",
    },
    { timestampFormat: "iso8601" },
  );

  prismaClient = new PrismaClient({ adapter });
  return prismaClient;
}

async function ensureTelemetrySchema(database: PrismaClient): Promise<void> {
  if (schemaInitialization) return schemaInitialization;

  const initialization = (async () => {
    await database.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS telemetry_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      tenant_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      environment TEXT NOT NULL,
      error_type TEXT NOT NULL,
      message TEXT NOT NULL,
      stack_trace TEXT NOT NULL,
      latency_ms REAL NOT NULL CHECK (latency_ms >= 0),
      status TEXT NOT NULL CHECK (status IN ('critical', 'error', 'warning', 'info')),
      received_at DATETIME NOT NULL,
      analysis_status TEXT NOT NULL CHECK (analysis_status IN ('queued', 'processing', 'completed', 'failed', 'not_requested')),
      root_cause TEXT,
      failing_component TEXT,
      terminal_patch_command TEXT,
      analysis_error TEXT,
      analysed_at DATETIME
    )`);

    await Promise.all([
      database.$executeRawUnsafe(
        "CREATE INDEX IF NOT EXISTS telemetry_logs_tenant_received_idx ON telemetry_logs (tenant_id, received_at DESC)",
      ),
      database.$executeRawUnsafe(
        "CREATE INDEX IF NOT EXISTS telemetry_logs_status_received_idx ON telemetry_logs (status, received_at DESC)",
      ),
    ]);
  })();

  schemaInitialization = initialization.catch((error: unknown) => {
    schemaInitialization = undefined;
    throw error;
  });

  return schemaInitialization;
}

export async function insertTelemetryLog(record: TelemetryLogRecord): Promise<void> {
  const database = databaseClient();
  await ensureTelemetrySchema(database);

  await database.telemetryLog.create({
    data: {
      id: record.id,
      tenantId: record.tenant.tenantId,
      tenantName: record.tenant.tenantName,
      serviceName: record.telemetry.serviceName,
      environment: record.telemetry.environment,
      errorType: record.telemetry.errorType,
      message: record.telemetry.message,
      stackTrace: record.telemetry.stackTrace,
      latency: record.telemetry.latency,
      status: record.telemetry.status,
      receivedAt: new Date(record.receivedAt),
      analysisStatus: record.analysisStatus,
    },
    select: { id: true },
  });
}

export async function markTelemetryAnalysisProcessing(id: string): Promise<void> {
  const database = databaseClient();
  await database.telemetryLog.update({
    where: { id },
    data: { analysisStatus: "processing" },
    select: { id: true },
  });
}

export async function completeTelemetryAnalysis(
  id: string,
  diagnosis: Diagnosis,
): Promise<void> {
  const database = databaseClient();
  await database.telemetryLog.update({
    where: { id },
    data: {
      analysisStatus: "completed",
      rootCause: diagnosis.rootCause,
      failingComponent: diagnosis.failingComponent,
      terminalPatchCommand: diagnosis.terminalPatchCommand,
      analysisError: null,
      analysedAt: new Date(),
    },
    select: { id: true },
  });
}

export async function failTelemetryAnalysis(id: string, reason: string): Promise<void> {
  const database = databaseClient();
  await database.telemetryLog.update({
    where: { id },
    data: {
      analysisStatus: "failed",
      analysisError: reason.slice(0, 500),
      analysedAt: new Date(),
    },
    select: { id: true },
  });
}
