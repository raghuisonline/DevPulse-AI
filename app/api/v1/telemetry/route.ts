import { after } from "next/server";
import { processTelemetryAnalysis } from "@/lib/telemetry/analysis";
import { authenticateApiToken } from "@/lib/telemetry/auth";
import { telemetryInputSchema } from "@/lib/telemetry/schemas";
import {
  insertTelemetryLog,
  TelemetryStorageConfigurationError,
} from "@/lib/telemetry/storage";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 96 * 1024;
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

const AUTH_HEADERS = {
  ...JSON_HEADERS,
  "WWW-Authenticate": 'Bearer realm="devpulse-telemetry"',
};

function jsonError(status: number, error: string, message: string): Response {
  return Response.json({ error, message }, { status, headers: JSON_HEADERS });
}

function isAnalysisSeverity(status: string): boolean {
  return status === "critical" || status === "error";
}

function unauthorized(error: string, message: string): Response {
  return Response.json({ error, message }, { status: 401, headers: AUTH_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  const authorization = request.headers.get("authorization")?.trim();

  if (!authorization) {
    return unauthorized(
      "missing_bearer_token",
      "The Authorization header must contain a Bearer API token.",
    );
  }

  const match = /^Bearer\s+([^\s,]+)$/i.exec(authorization);
  if (!match) {
    return unauthorized(
      "invalid_authorization_scheme",
      "Use the Authorization: Bearer <token> authentication scheme.",
    );
  }

  const tenant = authenticateApiToken(match[1]);
  if (!tenant) {
    return unauthorized(
      "invalid_api_token",
      "The Bearer API token is invalid or inactive.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "Telemetry payloads are limited to 96 KB.");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError(400, "invalid_body", "The request body could not be read.");
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "Telemetry payloads are limited to 96 KB.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return jsonError(400, "invalid_json", "The request body must contain valid JSON.");
  }

  const parsed = telemetryInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        error: "invalid_telemetry",
        message: "The telemetry payload did not match the required schema.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422, headers: JSON_HEADERS },
    );
  }

  const telemetryLogId = crypto.randomUUID();
  const analysisQueued = isAnalysisSeverity(parsed.data.status);

  try {
    await insertTelemetryLog({
      id: telemetryLogId,
      tenant,
      telemetry: parsed.data,
      receivedAt: new Date().toISOString(),
      analysisStatus: analysisQueued ? "queued" : "not_requested",
    });
  } catch (error) {
    console.error("Telemetry ingestion failed", {
      telemetryLogId,
      error: error instanceof Error ? error.message : "Unknown storage failure",
    });

    const message =
      error instanceof TelemetryStorageConfigurationError
        ? "Telemetry storage is not configured for this deployment."
        : "Telemetry storage is temporarily unavailable.";

    return jsonError(503, "ingestion_unavailable", message);
  }

  if (analysisQueued) {
    after(() =>
      processTelemetryAnalysis({
        telemetryLogId,
        telemetry: parsed.data,
      }),
    );
  }

  return Response.json(
    {
      accepted: true,
      telemetryLogId,
      analysisQueued,
      status: analysisQueued ? "queued" : "stored",
    },
    { status: 202, headers: JSON_HEADERS },
  );
}
