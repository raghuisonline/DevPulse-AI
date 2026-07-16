CREATE TABLE IF NOT EXISTS telemetry_logs (
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
);

CREATE INDEX IF NOT EXISTS telemetry_logs_tenant_received_idx
  ON telemetry_logs (tenant_id, received_at DESC);

CREATE INDEX IF NOT EXISTS telemetry_logs_status_received_idx
  ON telemetry_logs (status, received_at DESC);
