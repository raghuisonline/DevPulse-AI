export type IncidentStatus = "unresolved" | "analysing" | "resolved";
export type IncidentCategory = "Web" | "Database" | "Queue" | "Payments";

export type Incident = {
  id: string;
  title: string;
  service: string;
  environment: "Production" | "Staging";
  category: IncidentCategory;
  status: IncidentStatus;
  severity: "critical" | "warning" | "healthy";
  occurredAt: string;
  trace: string;
  rootCause: string;
  remediation: string;
  patch: string;
  confidence: number;
};

export type DashboardPayload = {
  tenant: {
    id: string;
    name: string;
    region: string;
  };
  metrics: {
    activeExceptions: number;
    averageResolution: string;
    systemHealth: number;
    patchesDeployed: number;
  };
  charts: Array<{
    time: string;
    exceptions: number;
    latency: number;
  }>;
  incidents: Incident[];
  updatedAt: string;
};

const incidents: Incident[] = [
  {
    id: "DP-2847",
    title: "Payment reconciliation crash",
    service: "payments-api",
    environment: "Production",
    category: "Payments",
    status: "unresolved",
    severity: "critical",
    occurredAt: "32s ago",
    trace:
      "TypeError: Cannot read properties of undefined (reading 'status')\n    at reconcilePayment (/services/payments.ts:184:21)\n    at processWebhook (/queues/webhooks.ts:72:9)\n    at async consume (/workers/stripe.ts:41:3)\nrequest_id=req_8f3a1c7\nregion=iad1",
    rootCause:
      "Webhook retries bypass the idempotency guard when a payment record has been evicted from the regional cache.",
    remediation:
      "Resolve the record through the persistent repository before reconciliation and fail closed when the payment cannot be found. This preserves idempotency and prevents an undefined cache result from reaching the state machine.",
    patch:
      "git checkout -b fix/dp-2847 && git apply patches/dp-2847-idempotency.patch",
    confidence: 99.7,
  },
  {
    id: "DP-2846",
    title: "Connection pool exhausted",
    service: "identity-db",
    environment: "Production",
    category: "Database",
    status: "unresolved",
    severity: "critical",
    occurredAt: "1m ago",
    trace:
      "PoolTimeoutError: unable to acquire PostgreSQL connection after 5000ms\n    at Pool.acquire (/db/pool.ts:91:13)\n    at getSession (/auth/session.ts:48:18)\nactive=80 idle=0 waiting=143",
    rootCause:
      "A missing transaction finalizer on the session refresh path leaks connections when token rotation throws.",
    remediation:
      "Wrap refresh persistence in a transaction boundary with an unconditional finally release, then cap concurrent refresh work per tenant.",
    patch:
      "git checkout -b fix/dp-2846 && git apply patches/dp-2846-pool-release.patch",
    confidence: 98.9,
  },
  {
    id: "DP-2845",
    title: "Checkout route elevated 5xx",
    service: "web-checkout",
    environment: "Production",
    category: "Web",
    status: "analysing",
    severity: "warning",
    occurredAt: "3m ago",
    trace:
      "HTTPError: upstream response 502\n    at submitOrder (/app/checkout/action.ts:118:11)\n    at async POST (/app/api/order/route.ts:54:7)\nupstream=inventory-api attempts=3",
    rootCause:
      "Analysis is correlating upstream inventory saturation with a checkout retry amplification pattern.",
    remediation:
      "A deterministic remediation plan is being assembled from the service graph and the last healthy deployment.",
    patch: "Patch generation pending root-cause verification.",
    confidence: 87.4,
  },
  {
    id: "DP-2844",
    title: "Webhook backlog growing",
    service: "event-dispatcher",
    environment: "Production",
    category: "Queue",
    status: "analysing",
    severity: "warning",
    occurredAt: "6m ago",
    trace:
      "QueueLagWarning: consumer lag exceeded 18,000 messages\n    at monitorPartition (/stream/health.ts:63:5)\npartition=payments.4 consumer=dispatch-v2",
    rootCause:
      "Analysis is verifying whether one malformed event is repeatedly failing without reaching the dead-letter queue.",
    remediation:
      "The agent is replaying the offending partition against the deterministic parser in an isolated environment.",
    patch: "Patch generation pending root-cause verification.",
    confidence: 76.2,
  },
  {
    id: "DP-2843",
    title: "Null locale in invoice renderer",
    service: "billing-worker",
    environment: "Production",
    category: "Payments",
    status: "resolved",
    severity: "healthy",
    occurredAt: "12m ago",
    trace:
      "RangeError: Incorrect locale information provided\n    at Intl.NumberFormat (<anonymous>)\n    at renderInvoice (/billing/invoice.ts:203:17)\ncustomer_region=unknown",
    rootCause:
      "Legacy accounts created before locale capture contain a null preference that was passed directly to Intl.NumberFormat.",
    remediation:
      "Normalize the locale at the domain boundary and fall back to the tenant billing locale before rendering monetary values.",
    patch:
      "git fetch origin pull/1842/head:hotfix/dp-2843 && git checkout hotfix/dp-2843",
    confidence: 99.9,
  },
  {
    id: "DP-2841",
    title: "Stale inventory cache reads",
    service: "inventory-api",
    environment: "Production",
    category: "Database",
    status: "resolved",
    severity: "healthy",
    occurredAt: "28m ago",
    trace:
      "ConsistencyError: cache version 184 is behind primary version 186\n    at assertVersion (/inventory/cache.ts:88:9)\n    at reserveStock (/inventory/reserve.ts:122:5)",
    rootCause:
      "The cache invalidation event was published before the inventory transaction committed, allowing a stale refill race.",
    remediation:
      "Publish invalidation from the transaction outbox after commit and reject cache entries older than the reservation watermark.",
    patch:
      "git fetch origin pull/1839/head:hotfix/dp-2841 && git checkout hotfix/dp-2841",
    confidence: 99.4,
  },
];

const chartData = [
  { time: "09:00", exceptions: 18, latency: 128 },
  { time: "10:00", exceptions: 24, latency: 142 },
  { time: "11:00", exceptions: 16, latency: 136 },
  { time: "12:00", exceptions: 31, latency: 168 },
  { time: "13:00", exceptions: 27, latency: 155 },
  { time: "14:00", exceptions: 43, latency: 204 },
  { time: "15:00", exceptions: 29, latency: 173 },
  { time: "16:00", exceptions: 36, latency: 188 },
  { time: "17:00", exceptions: 21, latency: 149 },
  { time: "Now", exceptions: 26, latency: 157 },
];

const tenants = {
  northstar: { id: "northstar", name: "Northstar Labs", region: "US East" },
  acme: { id: "acme", name: "Acme Cloud", region: "EU West" },
} as const;

export function getDashboardPayload(tenantId: string): DashboardPayload {
  const tenant = tenants[tenantId as keyof typeof tenants] ?? tenants.northstar;
  const modifier = tenant.id === "acme" ? 0.82 : 1;

  return {
    tenant,
    metrics: {
      activeExceptions: Math.round(42 * modifier),
      averageResolution: tenant.id === "acme" ? "3m 12s" : "2m 47s",
      systemHealth: tenant.id === "acme" ? 99.91 : 99.97,
      patchesDeployed: tenant.id === "acme" ? 84 : 128,
    },
    charts: chartData.map((point) => ({
      ...point,
      exceptions: Math.round(point.exceptions * modifier),
      latency: Math.round(point.latency * (tenant.id === "acme" ? 1.08 : 1)),
    })),
    incidents: tenant.id === "acme" ? incidents.slice(1) : incidents,
    updatedAt: new Date().toISOString(),
  };
}
