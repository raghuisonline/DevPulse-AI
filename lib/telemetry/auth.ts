import type { TenantIdentity } from "./schemas";

type ApiTokenRecord = TenantIdentity & { key: string };

function constantTimeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

function configuredTokens(): ApiTokenRecord[] {
  const raw = process.env.DEVPULSE_API_KEYS;

  if (!raw) {
    return process.env.NODE_ENV === "production"
      ? []
      : [
          {
            key: "dp_live_demo_key",
            tenantId: "northstar",
            tenantName: "Northstar Labs",
          },
        ];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is ApiTokenRecord => {
      if (!entry || typeof entry !== "object") return false;
      const record = entry as Record<string, unknown>;
      return (
        typeof record.key === "string" &&
        record.key.length >= 16 &&
        typeof record.tenantId === "string" &&
        record.tenantId.length > 0 &&
        typeof record.tenantName === "string" &&
        record.tenantName.length > 0
      );
    });
  } catch {
    return [];
  }
}

export function authenticateApiToken(apiToken: string): TenantIdentity | null {
  for (const record of configuredTokens()) {
    if (constantTimeEqual(apiToken, record.key)) {
      return { tenantId: record.tenantId, tenantName: record.tenantName };
    }
  }

  return null;
}
