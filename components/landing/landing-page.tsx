"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  KeyRound,
  LockKeyhole,
  Network,
  Quote,
  Radio,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";

const features = [
  {
    number: "01",
    title: "Telemetry Ingestion Pipeline",
    description:
      "Continuous capture over OpenTelemetry (OTLP), eBPF signals, and signed webhooks—normalized the instant they arrive.",
    icon: Radio,
    detail: "OTLP · eBPF · HTTPS webhooks",
  },
  {
    number: "02",
    title: "Git-Blame Context Engine",
    description:
      "Trace failures to the precise line, owner, and commit without leaving the incident timeline.",
    icon: GitBranch,
    detail: "Commit 8f3a1c7 identified",
  },
  {
    number: "03",
    title: "Deterministic AI Playbooks",
    description:
      "Zero-hallucination diagnostics grounded in deep stack parsing and your own service topology.",
    icon: ShieldCheck,
    detail: "Confidence 99.7%",
  },
  {
    number: "04",
    title: "Self-Healing Patch Agents",
    description:
      "Generate reviewed hotfixes and open an automated pull request with a single, controlled action.",
    icon: Bot,
    detail: "PR #1842 ready to merge",
  },
] as const;

const runtimeDemos = [
  {
    id: "node",
    label: "Node.js",
    error: "TypeError: Cannot read properties of undefined",
    frames: [
      "at reconcilePayment (payments.ts:184:21)",
      "at processWebhook (queue.ts:72:9)",
      "at async consume (worker.ts:41:3)",
    ],
    service: "payments-api",
    file: "payments.ts",
    removed: "- const payment = cache.get(id)",
    added: ["+ const payment = await resolve(id)", "+ if (!payment) throw NotFound(id)"],
    rootCause: "Webhook retries bypassed the idempotency guard when the payment record was evicted from cache.",
  },
  {
    id: "python",
    label: "Python",
    error: "AttributeError: 'NoneType' has no attribute 'status'",
    frames: [
      "File /app/payments/reconcile.py, line 184",
      "in process_webhook · queue.py:72",
      "in consume · worker.py:41",
    ],
    service: "billing-worker",
    file: "reconcile.py",
    removed: "- payment = cache.get(event.id)",
    added: ["+ payment = repository.resolve(event.id)", "+ if payment is None: raise PaymentNotFound()"],
    rootCause: "A retried event reached reconciliation after its cached payment object expired, returning None to the state handler.",
  },
  {
    id: "go",
    label: "Go",
    error: "panic: runtime error: invalid memory address",
    frames: [
      "payments/reconcile.go:184 +0x21",
      "workers/webhook.go:72 +0x9",
      "cmd/consumer/main.go:41 +0x3",
    ],
    service: "payments-consumer",
    file: "reconcile.go",
    removed: "- payment := cache.Get(id)",
    added: ["+ payment, err := store.Resolve(ctx, id)", "+ if err != nil { return err }"],
    rootCause: "The cache lookup returned a nil payment pointer and the webhook consumer dereferenced it without an error boundary.",
  },
] as const;

const workflowSteps = [
  {
    id: "telemetry",
    number: "01",
    title: "Ingest read-only telemetry",
    summary:
      "Send OTLP logs and traces, forward eBPF runtime signals, or connect signed HTTPS webhooks. DevPulse never requires shell access to production hosts.",
    icon: Radio,
    scope: "telemetry:write",
    access: "Inbound only",
    retention: "Customer policy",
    safeguards: ["PII and secret redaction", "Tenant-scoped API keys", "Payload schema validation"],
  },
  {
    id: "source",
    number: "02",
    title: "Map source context",
    summary:
      "A repository app reads only selected code and commit metadata so the Git-Blame engine can map a frame to its owning change.",
    icon: GitBranch,
    scope: "contents:read",
    access: "Selected repos",
    retention: "Ephemeral index",
    safeguards: ["No admin repository scope", "Branch allowlists", "Customer-controlled revocation"],
  },
  {
    id: "analysis",
    number: "03",
    title: "Run a bounded playbook",
    summary:
      "The context is isolated per tenant, evaluated against a strict response schema, and discarded by zero-retention LLM endpoints.",
    icon: ShieldCheck,
    scope: "diagnosis:run",
    access: "Tenant isolated",
    retention: "Zero LLM retention",
    safeguards: ["Deterministic JSON contract", "Prompt-injection boundaries", "Evidence-linked confidence"],
  },
  {
    id: "patch",
    number: "04",
    title: "Propose, never self-deploy",
    summary:
      "Patch agents create a review branch and pull request. They cannot merge, deploy, or mutate production data under the default policy.",
    icon: GitPullRequest,
    scope: "pull_requests:write",
    access: "Branch only",
    retention: "Git audit trail",
    safeguards: ["Human approval required", "Static checks before PR", "No production credentials"],
  },
] as const;

const integrations = [
  { name: "AWS", mark: "AWS", type: "Cloud telemetry" },
  { name: "Google Cloud", mark: "GCP", type: "Cloud telemetry" },
  { name: "GitHub", mark: "GH", type: "Source + pull requests" },
  { name: "GitLab", mark: "GL", type: "Source + merge requests" },
  { name: "Datadog", mark: "DD", type: "Logs + traces" },
  { name: "New Relic", mark: "NR", type: "APM + alerts" },
  { name: "Sentry", mark: "S", type: "Exceptions + releases" },
] as const;

const securityFeatures = [
  {
    title: "Zero LLM Retention",
    description:
      "Telemetry is stored only in your tenant-scoped data store under your retention policy. LLM providers do not retain it or use customer data for training.",
    icon: LockKeyhole,
  },
  {
    title: "SOC 2 Type II Certified",
    description:
      "Built to meet rigorous industry compliance standards. Our systems undergo continuous auditing to guarantee end-to-end data security.",
    icon: ShieldCheck,
  },
  {
    title: "Secure, Read-Only Access",
    description:
      "We use limited-scope OAuth tokens and IAM roles. DevPulse AI only reads the specific repository branches and log streams you authorize.",
    icon: KeyRound,
  },
  {
    title: "End-to-End Encryption",
    description:
      "All data transferred between your cluster and DevPulse AI is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
    icon: Network,
  },
] as const;

const faqs = [
  {
    question: "How does DevPulse AI connect to my application telemetry?",
    answer:
      "We natively support OpenTelemetry, eBPF, and standard webhooks. You can route your existing logs and traces from platforms like Datadog, New Relic, or AWS CloudWatch to our ingestion endpoint in under five minutes.",
  },
  {
    question: "Can the Patch Agent automatically push code changes to production?",
    answer:
      "No. By default, the Patch Agent operates in a ‘Suggest’ mode. It generates a detailed pull request (PR) with the proposed fix, complete with an explanation and test coverage. Your engineering team retains absolute control and must review and approve the PR before anything merges.",
  },
  {
    question: "Will DevPulse AI impact our application performance or add latency?",
    answer:
      "Not at all. DevPulse AI ingests data asynchronously from your log streams and APM tools. Because it runs out-of-band and does not sit in the critical path of your user traffic, it introduces zero runtime latency to your application.",
  },
  {
    question: "What programming languages and frameworks do you support?",
    answer:
      "Our Resolution Engine is language-agnostic for log parsing. For code analysis and automated patch generation, we fully support TypeScript/JavaScript, Python, Go, Java, and Rust, with support for more languages shipping every month.",
  },
] as const;

const testimonials = [
  {
    quote:
      "Our payment incident reviews used to start with 40 minutes of log archaeology. Now the first hypothesis arrives with the exact commit and owner already attached.",
    role: "DevOps Lead",
    company: "Fintech platform · 60 services",
    result: "MTTR reduced from 47m to 11m",
  },
  {
    quote:
      "The important part is not that it writes a patch—it is that every change is evidence-linked, scoped to a branch, and still goes through our normal review policy.",
    role: "Senior Site Reliability Engineer",
    company: "Global marketplace · 24/7 on-call",
    result: "31% fewer escalations",
  },
  {
    quote:
      "We connected Sentry and GitHub in one morning. DevPulse caught the next regression, found the release that caused it, and prepared a reviewable fix.",
    role: "Platform Engineering Manager",
    company: "B2B cloud team · Multi-region",
    result: "First verified PR in under 4m",
  },
] as const;

const pricing = [
  {
    name: "Starter",
    eyebrow: "For side projects",
    monthly: "$0",
    annual: "$0",
    suffix: "/ month",
    description: "Production visibility without the overhead.",
    monthlyNote: "No billing required · 10 GB included monthly",
    annualNote: "No billing required · 10 GB included monthly",
    features: ["Up to 3 services", "10 GB telemetry / month", "Basic alert metrics"],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    eyebrow: "For shipping teams",
    monthly: "$49",
    annual: "$39.20",
    suffix: "/ month",
    description: "The full AI incident response engine.",
    monthlyNote: "Billed monthly · $588 at the 12-month rate",
    annualNote: "$470.40 billed annually · exactly 20% off $588",
    features: [
      "Unlimited services",
      "250 GB telemetry / month",
      "Contextual AI diagnosis",
      "Slack + PagerDuty webhooks",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    eyebrow: "For critical systems",
    monthly: "Custom",
    annual: "Custom",
    suffix: "",
    description: "Dedicated infrastructure, governance, and support.",
    monthlyNote: "Volume-based contract",
    annualNote: "Volume-based annual contract",
    features: [
      "Dedicated ingestion cluster",
      "Custom retention windows",
      "SLA guarantees",
      "Priority incident support",
    ],
    cta: "Talk to an engineer",
    highlighted: false,
  },
] as const;

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const [activeRuntime, setActiveRuntime] = useState(0);
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const runtimeDemo = runtimeDemos[activeRuntime];
  const workflow = workflowSteps[activeWorkflow];
  const WorkflowIcon = workflow.icon;

  return (
    <main className="marketing-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="marketing-nav" aria-label="Primary navigation">
        <Logo />
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#integrations">Integrations</a>
          <a href="#pricing">Pricing</a>
          <Link href="/docs">Docs</Link>
          <Link href="/dashboard">Control Center</Link>
        </div>
        <div className="nav-actions">
          <Link className="text-button" href="/dashboard">
            Sign in
          </Link>
          <Link className="button button-sm button-light" href="/dashboard">
            Start free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <section className="hero section-grid">
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div className="eyebrow-pill" variants={reveal}>
            <Sparkles size={13} aria-hidden="true" />
            AI-native incident response
            <ChevronRight size={13} />
          </motion.div>
          <motion.h1 variants={reveal}>
            Stop Searching Logs.
            <br />
            <span>Let AI Fix the Outage.</span>
          </motion.h1>
          <motion.p className="hero-lede" variants={reveal}>
            DevPulse correlates every signal, isolates the root cause, and turns
            production failures into verified patches—before your incident call
            gets crowded.
          </motion.p>
          <motion.div className="hero-actions" variants={reveal}>
            <Link className="button button-primary" href="/dashboard">
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link className="button button-ghost" href="/dashboard">
              Explore dashboard <ArrowRight size={14} />
            </Link>
          </motion.div>
          <motion.div className="hero-proof" variants={reveal}>
            <div className="avatar-stack" aria-hidden="true">
              <span>AK</span>
              <span>MV</span>
              <span>SL</span>
            </div>
            <p>
              <strong>Trusted by 2,400+ on-call engineers.</strong>
              <span>No card required.</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          id="product-preview"
          className="resolution-console"
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="console-topbar">
            <div className="console-title">
              <span className="console-icon">
                <TerminalSquare size={15} />
              </span>
              <span>Incident DP-2847</span>
              <span className="pill pill-error">Production</span>
            </div>
            <div className="runtime-tabs" role="tablist" aria-label="Runtime example">
              {runtimeDemos.map((runtime, index) => (
                <button
                  className={activeRuntime === index ? "active" : ""}
                  key={runtime.id}
                  onClick={() => setActiveRuntime(index)}
                  type="button"
                  role="tab"
                  aria-selected={activeRuntime === index}
                >
                  {runtime.label}
                </button>
              ))}
            </div>
            <div className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              className="console-grid"
              key={runtimeDemo.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.18 }}
            >
            <div className="trace-pane">
              <div className="pane-heading">
                <span>Example Trace Output</span>
                <span className="example-label">Sanitized sample</span>
              </div>
              <pre>
                <code>
                  <span className="code-error-line"><span className="code-red">{runtimeDemo.error.split(":")[0]}:</span>{runtimeDemo.error.slice(runtimeDemo.error.indexOf(":") + 1)}</span>
                  <span className="code-gap" />
                  {runtimeDemo.frames.map((frame) => (
                    <span className="code-frame" key={frame}><span className="code-muted">›</span> {frame}</span>
                  ))}
                  <span className="code-gap" />
                  <span className="code-frame"><span className="code-label">service</span> {runtimeDemo.service}</span>
                  <span className="code-frame"><span className="code-label">commit</span> 8f3a1c7</span>
                  <span className="code-frame"><span className="code-label">region</span> iad1</span>
                </code>
              </pre>
            </div>
            <div className="diagnostic-pane">
              <div className="pane-heading">
                <span>Sample Analysis</span>
                <span className="pill pill-healthy">Verified</span>
              </div>
              <div className="diagnostic-status">
                <span className="spark-icon">
                  <Sparkles size={16} />
                </span>
                <div>
                  <strong>Root cause isolated</strong>
                  <p>in 2.4 seconds · 99.7% confidence</p>
                </div>
              </div>
              <div className="root-cause">
                <span>ROOT CAUSE</span>
                <p>
                  {runtimeDemo.rootCause}
                </p>
              </div>
              <div className="diff-block">
                <div className="diff-header">
                  <span>{runtimeDemo.file}</span>
                  <span>+3 −1</span>
                </div>
                <pre>
                  <span className="diff-remove">{runtimeDemo.removed}</span>
                  {runtimeDemo.added.map((line) => (
                    <span className="diff-add" key={line}>{line}</span>
                  ))}
                </pre>
              </div>
              <button className="patch-button" type="button">
                <GitBranch size={15} /> Open verified pull request
                <ArrowRight size={14} />
              </button>
            </div>
            </motion.div>
          </AnimatePresence>
          <div className="console-footer">
            <span>Example remediation output</span>
            <span>Protected by deterministic guardrails</span>
          </div>
        </motion.div>
      </section>

      <section className="metrics-ribbon" aria-label="DevPulse performance">
        <div>
          <strong>94%</strong>
          <span>Faster MTTR</span>
        </div>
        <div>
          <strong>&lt; 4 min</strong>
          <span>Zero setup configuration</span>
        </div>
        <div>
          <strong>99.99%</strong>
          <span>Diagnostic accuracy</span>
        </div>
        <div className="ribbon-status">OpenTelemetry · eBPF · Webhooks</div>
      </section>

      <section id="platform" className="content-section platform-section">
        <div className="section-kicker">
          <ScanSearch size={14} /> The resolution engine
        </div>
        <div className="section-heading-row">
          <h2>Every signal. One verified answer.</h2>
          <p>
            A deterministic context engine that understands your code, runtime,
            and deployment history as one continuous system.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                className={`feature-card feature-card-${index + 1}`}
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="feature-card-top">
                  <span>{feature.number}</span>
                  <Icon size={19} />
                </div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="feature-signal">
                  <span className="signal-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  {feature.detail}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="content-section safe-access-section">
        <div className="section-kicker">
          <KeyRound size={14} /> Least-privilege by design
        </div>
        <div className="section-heading-row safe-heading-row">
          <h2>Deep context without broad infrastructure access.</h2>
          <p>
            DevPulse works through narrow, revocable permissions. It observes
            signals, reads only selected source, and proposes changes through
            the review controls your team already trusts.
          </p>
        </div>

        <div className="safe-workflow">
          <div className="workflow-tabs" role="tablist" aria-label="Safe resolution workflow">
            {workflowSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  className={activeWorkflow === index ? "active" : ""}
                  key={step.id}
                  onClick={() => setActiveWorkflow(index)}
                  type="button"
                  role="tab"
                  aria-selected={activeWorkflow === index}
                  aria-controls="workflow-detail"
                >
                  <span>{step.number}</span>
                  <StepIcon size={16} />
                  <strong>{step.title}</strong>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>

          <div className="workflow-stage" id="workflow-detail" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.article
                className="workflow-detail"
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="workflow-copy">
                  <span className="workflow-icon"><WorkflowIcon size={19} /></span>
                  <div className="workflow-step-label">Step {workflow.number}</div>
                  <h3>{workflow.title}</h3>
                  <p>{workflow.summary}</p>
                  <ul>
                    {workflow.safeguards.map((item) => (
                      <li key={item}><CheckCircle2 size={14} /> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="permissions-console">
                  <div className="permissions-header">
                    <span><LockKeyhole size={13} /> Effective permissions</span>
                    <span className="pill pill-healthy">Policy enforced</span>
                  </div>
                  <dl>
                    <div><dt>Scope</dt><dd><code>{workflow.scope}</code></dd></div>
                    <div><dt>Access boundary</dt><dd>{workflow.access}</dd></div>
                    <div><dt>Context retention</dt><dd>{workflow.retention}</dd></div>
                    <div><dt>Production mutation</dt><dd className="denied-value">Denied</dd></div>
                  </dl>
                  <div className="policy-footer">
                    <ShieldCheck size={15} />
                    <span>
                      <strong>Human-in-the-loop policy</strong>
                      Every patch remains a normal reviewable pull request.
                    </span>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="integrations" className="content-section integrations-section">
        <div className="integrations-heading">
          <div>
            <div className="section-kicker"><Network size={14} /> Connect your stack</div>
            <h2>Meet your telemetry where it already lives.</h2>
            <p>
              Bring existing cloud, source, and observability context together
              without replacing the tools your team already operates.
            </p>
          </div>
          <Link className="button button-ghost" href="/docs#integrations">
            Integration guide <ExternalLink size={14} />
          </Link>
        </div>
        <div className="integration-grid">
          {integrations.map((integration, index) => (
            <motion.article
              className="integration-card"
              key={integration.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <span className="integration-mark">{integration.mark}</span>
              <div><strong>{integration.name}</strong><small>{integration.type}</small></div>
              <Check size={13} />
            </motion.article>
          ))}
          <article className="integration-card integration-more">
            <span className="integration-mark"><Code2 size={15} /></span>
            <div><strong>OpenTelemetry</strong><small>OTLP + secure REST API</small></div>
            <ArrowRight size={13} />
          </article>
        </div>
      </section>

      <section className="content-section testimonials-section">
        <div className="testimonials-heading">
          <div className="section-kicker"><Quote size={14} /> On-call outcomes</div>
          <h2>Less archaeology. More resolution.</h2>
          <p>Role-based feedback from teams evaluating DevPulse in production workflows.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              className="testimonial-card"
              key={testimonial.role}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Quote size={18} />
              <blockquote>“{testimonial.quote}”</blockquote>
              <figcaption>
                <span className="role-avatar">{testimonial.role.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
                <span><strong>{testimonial.role}</strong><small>{testimonial.company}</small></span>
              </figcaption>
              <div className="testimonial-result"><CheckCircle2 size={13} /> {testimonial.result}</div>
            </motion.figure>
          ))}
        </div>
      </section>

      <section id="quickstart" className="content-section quickstart-section">
        <div className="quickstart-copy">
          <div className="section-kicker"><BookOpen size={14} /> Quick start</div>
          <h2>Send your first exception in four minutes.</h2>
          <p>
            Create a tenant-scoped key, post one structured failure, and receive
            a durable acknowledgement with AI analysis queued out-of-band. No
            daemon or cluster-wide agent required.
          </p>
          <Link className="button button-light" href="/docs">
            Read the documentation <ArrowRight size={15} />
          </Link>
        </div>
        <div className="quickstart-code">
          <div className="code-window-header"><span>POST</span> /api/v1/telemetry <em>202 Accepted</em></div>
          <pre><code><span className="code-purple">curl</span> -X POST https://api.devpulse.ai/v1/telemetry \
  -H <span className="code-green">&quot;authorization: Bearer $DEVPULSE_KEY&quot;</span> \
  -d <span className="code-green">{`'{"serviceName":"payments-api", ...}'`}</span></code></pre>
          <div className="code-response"><CheckCircle2 size={13} /> accepted · telemetryLogId · analysisQueued</div>
        </div>
      </section>

      <section id="pricing" className="content-section pricing-section">
        <div className="pricing-heading">
          <div>
            <div className="section-kicker">Simple, metered pricing</div>
            <h2>Start resolving incidents today.</h2>
            <p>Scale from your first service to a dedicated global cluster.</p>
          </div>
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button
              className={!annual ? "active" : ""}
              onClick={() => setAnnual(false)}
              type="button"
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              className={annual ? "active" : ""}
              onClick={() => setAnnual(true)}
              type="button"
              aria-pressed={annual}
            >
              Annual <span>Save 20%</span>
            </button>
          </div>
        </div>
        <div className="pricing-grid">
          {pricing.map((plan) => (
            <article
              className={`pricing-card ${plan.highlighted ? "pricing-featured" : ""}`}
              key={plan.name}
            >
              {plan.highlighted && <div className="popular-label">Most popular</div>}
              <div className="plan-heading">
                <span>{plan.eyebrow}</span>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              <div className="plan-price">
                <strong>{annual ? plan.annual : plan.monthly}</strong>
                <span>{plan.suffix}</span>
              </div>
              <div className="annual-note">
                {annual ? plan.annualNote : plan.monthlyNote}
              </div>
              <Link
                className={`button plan-button ${plan.highlighted ? "button-primary" : "button-ghost"}`}
                href="/dashboard"
              >
                {plan.cta} <ArrowRight size={15} />
              </Link>
              <div className="plan-divider" />
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span><Check size={13} /></span> {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section security-section" aria-labelledby="security-title">
        <div className="security-heading">
          <div>
            <div className="section-kicker"><LockKeyhole size={14} /> Security & compliance</div>
            <h2 id="security-title">Enterprise-Grade Security by Design</h2>
            <p>
              DevPulse AI integrates safely with your infrastructure,
              protecting your data and code at every step.
            </p>
          </div>
          <a className="security-link" href="mailto:security@devpulse.ai">
            Request the security package <ArrowRight size={13} />
          </a>
        </div>
        <div className="security-feature-grid">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                className="security-feature-card"
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <span className="security-feature-icon"><Icon size={18} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="security-standards" aria-label="Encryption and access standards">
          <span><CheckCircle2 size={13} /> TLS 1.3 in transit</span>
          <span><CheckCircle2 size={13} /> AES-256 at rest</span>
          <span><CheckCircle2 size={13} /> Tenant-isolated processing</span>
          <span><CheckCircle2 size={13} /> Revocable access scopes</span>
        </div>
      </section>

      <section className="content-section faq-section" aria-labelledby="faq-title">
        <div className="faq-heading">
          <div className="section-kicker"><BookOpen size={14} /> Technical FAQ</div>
          <h2 id="faq-title">Answers before you connect production.</h2>
          <p>
            The implementation details engineering teams ask about before
            routing their first signal.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question} open={index === 0}>
              <summary>
                <span>{faq.question}</span>
                <ChevronDown size={17} aria-hidden="true" />
              </summary>
              <div className="faq-answer"><p>{faq.answer}</p></div>
            </details>
          ))}
        </div>
      </section>

      <section className="content-section final-cta">
        <div className="cta-orbit" aria-hidden="true" />
        <div className="section-kicker">Your next incident can be shorter</div>
        <h2>Give your on-call team their night back.</h2>
        <p>
          Ingest your first service in minutes. No agents, no dashboards to
          configure, no credit card.
        </p>
        <div className="hero-actions">
          <Link className="button button-light" href="/dashboard">
            Start free trial <ArrowRight size={16} />
          </Link>
          <a className="button button-ghost" href="mailto:hello@devpulse.ai">
            Talk to an engineer
          </a>
        </div>
      </section>

      <footer className="marketing-footer">
        <Logo />
        <p>© 2026 DevPulse Systems, Inc. Built for the people carrying the pager.</p>
        <div>
          <Link href="/docs">Documentation</Link>
          <a href="mailto:security@devpulse.ai">Security</a>
          <a href="mailto:privacy@devpulse.ai">Privacy</a>
          <Link href="/dashboard">Status</Link>
        </div>
      </footer>
    </main>
  );
}
