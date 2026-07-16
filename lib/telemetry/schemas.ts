import { z } from "zod";

export const telemetryInputSchema = z
  .object({
    serviceName: z.string().trim().min(1).max(120),
    environment: z.enum(["production", "staging", "development", "test"]),
    errorType: z.string().trim().min(1).max(240),
    message: z.string().trim().min(1).max(8_000),
    stackTrace: z.string().trim().min(1).max(64_000),
    latency: z.number().finite().nonnegative().max(3_600_000),
    status: z.enum(["critical", "error", "warning", "info"]).default("error"),
  })
  .strict();

export const diagnosisSchema = z
  .object({
    rootCause: z.string().trim().min(10).max(2_000),
    failingComponent: z.string().trim().min(1).max(240),
    terminalPatchCommand: z.string().trim().min(1).max(1_000),
  })
  .strict();

export type TelemetryInput = z.infer<typeof telemetryInputSchema>;
export type Diagnosis = z.infer<typeof diagnosisSchema>;

export type TenantIdentity = {
  tenantId: string;
  tenantName: string;
};
