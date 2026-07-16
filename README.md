# DevPulse AI

AI-native incident resolution and smart observability for developers and DevOps teams. DevPulse ingests production telemetry, removes noisy stack frames and secrets, authenticates every event to a tenant, and returns a schema-validated diagnosis with a reviewable patch command.

## Product surfaces

- `/` — conversion landing page, product demonstration, features, and interactive pricing
- `/dashboard` — multi-tenant telemetry control center with metrics, charts, and incident Kanban
- `GET /api/v1/incidents` — tenant-scoped dashboard payload
- `POST /api/v1/telemetry` — authenticated telemetry ingestion and AI diagnosis

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and configure at least one LLM provider. The local-only ingestion key `dp_live_demo_key` is available when `NODE_ENV` is not `production`.

## Telemetry API

Send a tenant-scoped Bearer token and a strict JSON body:

```json
{
  "serviceName": "payments-api",
  "environment": "production",
  "errorType": "TypeError",
  "message": "TypeError: payment is undefined",
  "stackTrace": "at reconcilePayment (/services/payments.ts:184:21)",
  "latency": 184,
  "status": "error"
}
```

Set `Authorization: Bearer <token>` on the request. Logs are written through Prisma before the endpoint returns `202 Accepted`; critical and error events continue into asynchronous diagnosis. Production tenant credentials are configured through `DEVPULSE_API_KEYS`, a JSON array of token and tenant records shown in `.env.example`.

## Quality gates

```bash
npx tsc --noEmit
npm run build
```

The application targets the Next.js App Router through vinext and produces a Cloudflare Worker-compatible ESM deployment.
