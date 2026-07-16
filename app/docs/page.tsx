import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  FileKey2,
  GitPullRequest,
  LockKeyhole,
  Radio,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Integrate DevPulse AI telemetry and incident diagnosis in minutes.",
};

const requestBody = `{
  "serviceName": "payments-api",
  "environment": "production",
  "errorType": "TypeError",
  "message": "TypeError: payment is undefined",
  "stackTrace": "at reconcilePayment (payments.ts:184:21)",
  "latency": 184,
  "status": "error"
}`;

const responseBody = `{
  "accepted": true,
  "telemetryLogId": "0194f3e2-7c26-7e59-a899-4b7df411db91",
  "analysisQueued": true,
  "status": "queued"
}`;

export default function DocsPage() {
  return (
    <main className="docs-shell">
      <header className="docs-header">
        <Logo />
        <div className="docs-header-links">
          <Link href="/"><ArrowLeft size={13} /> Back to site</Link>
          <Link className="button button-sm button-primary" href="/dashboard">
            Open console <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <span>GET STARTED</span>
          <a className="active" href="#quick-start">Quick start</a>
          <a href="#authentication">Authentication</a>
          <a href="#request">Telemetry request</a>
          <a href="#response">Diagnosis response</a>
          <span>PLATFORM</span>
          <a href="#integrations">Integrations</a>
          <a href="#security">Security model</a>
          <Link href="/dashboard">Control Center</Link>
        </aside>

        <article className="docs-content">
          <div className="docs-eyebrow"><BookOpen size={13} /> DevPulse documentation</div>
          <h1 id="quick-start">Resolve your first exception.</h1>
          <p className="docs-lede">
            DevPulse accepts structured server failures over a tenant-scoped
            endpoint, removes noisy frames and secrets, then returns a strict,
            evidence-bounded diagnosis.
          </p>

          <div className="docs-callout">
            <CheckCircle2 size={17} />
            <span><strong>Before you begin</strong> You need a DevPulse workspace and an ingestion key with telemetry:write scope.</span>
          </div>

          <section className="docs-section" id="authentication">
            <div className="docs-section-icon"><FileKey2 size={17} /></div>
            <div>
              <span className="docs-step">STEP 01</span>
              <h2>Create a scoped ingestion key</h2>
              <p>
                Generate a key from <strong>Control Center → API Access Keys</strong>.
                Keys belong to one tenant and can be revoked without affecting
                another workspace.
              </p>
              <div className="docs-code-line">
                <code><span>$</span> export DEVPULSE_KEY=dp_live_••••••••••••</code>
              </div>
            </div>
          </section>

          <section className="docs-section" id="request">
            <div className="docs-section-icon"><Radio size={17} /></div>
            <div>
              <span className="docs-step">STEP 02</span>
              <h2>Post a structured failure</h2>
              <p>
                Send the service, environment, error type, failure message, raw
                stack trace, observed latency, and severity. Payloads are capped,
                schema-validated, and persisted before analysis is queued.
              </p>
              <div className="docs-code-block">
                <div><span>request.json</span><em>application/json</em></div>
                <pre><code>{requestBody}</code></pre>
              </div>
              <div className="docs-code-block">
                <div><span>terminal</span><em>HTTPS</em></div>
                <pre><code><span className="code-purple">curl</span> -X POST https://api.devpulse.ai/v1/telemetry \
  -H <span className="code-green">&quot;authorization: Bearer $DEVPULSE_KEY&quot;</span> \
  -H <span className="code-green">&quot;content-type: application/json&quot;</span> \
  --data @request.json</code></pre>
              </div>
            </div>
          </section>

          <section className="docs-section" id="response">
            <div className="docs-section-icon"><Code2 size={17} /></div>
            <div>
              <span className="docs-step">STEP 03</span>
              <h2>Receive an immediate acknowledgement</h2>
              <p>
                Successful requests return HTTP 202 as soon as the log is stored.
                Critical and error events continue into deterministic AI analysis
                out-of-band, keeping the ingestion path off your critical path.
              </p>
              <div className="docs-code-block response-block">
                <div><span>response.json</span><em>202 Accepted</em></div>
                <pre><code>{responseBody}</code></pre>
              </div>
            </div>
          </section>

          <section className="docs-reference-section" id="integrations">
            <div className="docs-reference-heading">
              <span><GitPullRequest size={15} /> Integrations</span>
              <h2>Connect only the context you need.</h2>
            </div>
            <div className="docs-reference-grid">
              <div><strong>Observability</strong><p>Datadog, New Relic, Sentry, and any OpenTelemetry-compatible exporter.</p></div>
              <div><strong>Source control</strong><p>GitHub and GitLab with repository selection and branch-scoped pull request access.</p></div>
              <div><strong>Cloud telemetry</strong><p>AWS and Google Cloud events through scoped service identities or signed webhooks.</p></div>
            </div>
          </section>

          <section className="docs-reference-section" id="security">
            <div className="docs-reference-heading">
              <span><LockKeyhole size={15} /> Security model</span>
              <h2>Fail closed. Keep humans in control.</h2>
            </div>
            <div className="docs-security-list">
              <div><ShieldCheck size={16} /><span><strong>Zero LLM Retention</strong><p>Customer code is sent only to zero-retention model endpoints and is never used to train shared models.</p></span></div>
              <div><FileKey2 size={16} /><span><strong>Tenant-scoped credentials</strong><p>Ingestion and repository permissions are isolated, revocable, and auditable per workspace.</p></span></div>
              <div><GitPullRequest size={16} /><span><strong>Review-first patches</strong><p>Agents create branches and pull requests. Default policy denies merge, deploy, and production mutation.</p></span></div>
            </div>
          </section>

          <footer className="docs-footer">
            <div><strong>Ready to inspect your telemetry?</strong><p>Open the multi-tenant Control Center and explore a complete incident workflow.</p></div>
            <Link className="button button-primary" href="/dashboard">Open Control Center <ArrowRight size={14} /></Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
