import { diagnoseTelemetry } from "@/lib/ai/diagnose";
import type { TelemetryInput } from "./schemas";
import {
  completeTelemetryAnalysis,
  failTelemetryAnalysis,
  markTelemetryAnalysisProcessing,
} from "./storage";

type AnalysisJob = {
  telemetryLogId: string;
  telemetry: TelemetryInput;
};

function analysisFailureReason(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return "Unknown telemetry analysis failure";
}

export async function processTelemetryAnalysis(job: AnalysisJob): Promise<void> {
  try {
    await markTelemetryAnalysisProcessing(job.telemetryLogId);
    const diagnosis = await diagnoseTelemetry(job.telemetry);
    await completeTelemetryAnalysis(job.telemetryLogId, diagnosis);
  } catch (error) {
    const reason = analysisFailureReason(error);

    try {
      await failTelemetryAnalysis(job.telemetryLogId, reason);
    } catch (storageError) {
      console.error("Telemetry analysis status update failed", {
        telemetryLogId: job.telemetryLogId,
        error: analysisFailureReason(storageError),
      });
    }

    console.error("Telemetry analysis failed", {
      telemetryLogId: job.telemetryLogId,
      error: reason,
    });
  }
}
