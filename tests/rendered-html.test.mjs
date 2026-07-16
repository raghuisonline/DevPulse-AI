import assert from "node:assert/strict";
import test from "node:test";

process.env.DEVPULSE_API_KEYS = JSON.stringify([
  {
    key: "dp_test_telemetry_key_123",
    tenantId: "tenant_test",
    tenantName: "Test Workspace",
  },
]);
delete process.env.LIBSQL_DATABASE_URL;
delete process.env.LIBSQL_AUTH_TOKEN;

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const workerPromise = import(workerUrl.href).then(({ default: worker }) => worker);

async function workerFetch(request) {
  const worker = await workerPromise;

  return worker.fetch(
    request,
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the DevPulse landing page", async () => {
  const response = await workerFetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>DevPulse AI — AI-Native Incident Resolution<\/title>/i);
  assert.match(html, /Stop Searching Logs/);
  assert.match(html, /Enterprise-Grade Security by Design/);
  assert.match(html, /Technical FAQ/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("rejects missing and invalid telemetry credentials", async () => {
  const missing = await workerFetch(
    new Request("http://localhost/api/v1/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  );
  assert.equal(missing.status, 401);
  assert.deepEqual(await missing.json(), {
    error: "missing_bearer_token",
    message: "The Authorization header must contain a Bearer API token.",
  });
  assert.match(missing.headers.get("www-authenticate") ?? "", /^Bearer\b/);

  const malformed = await workerFetch(
    new Request("http://localhost/api/v1/telemetry", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Basic ZGV2cHVsc2U6a2V5",
      },
      body: "{}",
    }),
  );
  assert.equal(malformed.status, 401);
  assert.deepEqual(await malformed.json(), {
    error: "invalid_authorization_scheme",
    message: "Use the Authorization: Bearer <token> authentication scheme.",
  });

  const invalid = await workerFetch(
    new Request("http://localhost/api/v1/telemetry", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer invalid-telemetry-key",
      },
      body: "{}",
    }),
  );
  assert.equal(invalid.status, 401);
  assert.deepEqual(await invalid.json(), {
    error: "invalid_api_token",
    message: "The Bearer API token is invalid or inactive.",
  });
});

test("enforces the complete telemetry payload schema", async () => {
  const response = await workerFetch(
    new Request("http://localhost/api/v1/telemetry", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer dp_test_telemetry_key_123",
      },
      body: JSON.stringify({
        serviceName: "payments-api",
        environment: "production",
        message: "payment is undefined",
        stackTrace: "at reconcilePayment (payments.ts:184:21)",
        latency: 184,
      }),
    }),
  );

  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.error, "invalid_telemetry");
  assert.ok(Array.isArray(body.fields.errorType));
});
