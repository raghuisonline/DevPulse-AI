"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileKey2,
  Gauge,
  Globe2,
  Layers3,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Radio,
  Search,
  ServerCog,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Logo } from "@/components/brand/logo";
import type {
  DashboardPayload,
  Incident,
  IncidentCategory,
  IncidentStatus,
} from "@/lib/incidents";

const navItems = [
  { label: "Control Center", icon: BarChart3, active: true },
  { label: "Active Incidents", icon: AlertTriangle, badge: "4" },
  { label: "API Access Keys", icon: FileKey2 },
  { label: "Core Settings", icon: Settings2 },
  { label: "Billing Profile", icon: CircleDollarSign },
] as const;

const columns: Array<{
  id: IncidentStatus;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "unresolved",
    label: "Unresolved Errors",
    description: "Awaiting triage",
    color: "red",
  },
  {
    id: "analysing",
    label: "AI Analysing",
    description: "Correlating context",
    color: "amber",
  },
  {
    id: "resolved",
    label: "Resolved Fixes",
    description: "Patch verified",
    color: "green",
  },
];

const categoryIcons: Record<IncidentCategory, typeof Globe2> = {
  Web: Globe2,
  Database,
  Queue: Webhook,
  Payments: CircleDollarSign,
};

async function fetchDashboard(tenantId: string): Promise<DashboardPayload> {
  const response = await fetch("/api/v1/incidents", {
    headers: { "x-devpulse-tenant": tenantId },
  });

  if (!response.ok) {
    throw new Error("Unable to load the incident stream.");
  }

  return (await response.json()) as DashboardPayload;
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.[0]) return null;

  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>
        {payload[0].value}
        {unit}
      </strong>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "purple" | "green" | "blue";
  icon: typeof Activity;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${tone}`}>
        <Icon size={17} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value-row">
        <strong>{value}</strong>
        <span className={tone === "red" ? "trend-negative" : "trend-positive"}>
          {tone === "red" ? <ArrowDownRight size={12} /> : <ArrowRight size={12} />}
          {detail}
        </span>
      </div>
      <div className="metric-spark" aria-hidden="true">
        {[4, 7, 5, 10, 8, 13, 9, 12, 16, 14, 18, 17].map((height, index) => (
          <i key={`${height}-${index}`} style={{ height: `${height}px` }} />
        ))}
      </div>
    </article>
  );
}

function IncidentCard({
  incident,
  onOpen,
}: {
  incident: Incident;
  onOpen: (incident: Incident) => void;
}) {
  const CategoryIcon = categoryIcons[incident.category];

  return (
    <button
      className={`incident-card incident-${incident.status}`}
      onClick={() => onOpen(incident)}
      type="button"
      aria-label={`Open ${incident.id}: ${incident.title}`}
    >
      {incident.status === "analysing" && (
        <span className="scan-line" aria-hidden="true" />
      )}
      <span className="incident-card-top">
        <span className={`incident-category category-${incident.category.toLowerCase()}`}>
          <CategoryIcon size={12} /> {incident.category}
        </span>
        <span className="incident-time">{incident.occurredAt}</span>
      </span>
      <span className="incident-id">{incident.id}</span>
      <strong>{incident.title}</strong>
      <span className="incident-service">
        <ServerCog size={13} /> {incident.service}
        <i /> {incident.environment}
      </span>
      {incident.status === "analysing" && (
        <span className="analysis-progress">
          <span>
            <Sparkles size={12} /> Parsing stack context
          </span>
          <span className="progress-dots"><i /><i /><i /></span>
        </span>
      )}
      {incident.status === "resolved" && (
        <span className="hotfix-link">
          <CheckCircle2 size={13} /> View hotfix patch <ArrowRight size={13} />
        </span>
      )}
      {incident.status === "unresolved" && (
        <span className="error-frequency">
          <Radio size={12} /> Recurring across 3 regions
        </span>
      )}
    </button>
  );
}

function IncidentDrawer({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const copyPatch = async () => {
    await navigator.clipboard.writeText(incident.patch);
    setCopied(true);
  };

  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.aside
        className="incident-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-drawer-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <div className="drawer-header">
          <div>
            <span className={`status-pill status-${incident.status}`}>
              {incident.status === "analysing" && <span className="mini-spinner" />}
              {incident.status}
            </span>
            <span className="incident-id">{incident.id}</span>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close incident details">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-title-block">
          <h2 id="incident-drawer-title">{incident.title}</h2>
          <p>
            <ServerCog size={13} /> {incident.service}
            <span /> {incident.environment}
            <span /> {incident.occurredAt}
          </p>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span><Terminal size={14} /> Raw exception trace</span>
              <button className="copy-button" onClick={() => void navigator.clipboard.writeText(incident.trace)} type="button">
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre className="raw-trace"><code>{incident.trace}</code></pre>
          </section>

          <section className="ai-remediation-card">
            <div className="ai-card-header">
              <span className="spark-icon"><Sparkles size={16} /></span>
              <div>
                <span>DEVPULSE ANALYSIS</span>
                <strong>Deterministic remediation</strong>
              </div>
              <span className="confidence-score">{incident.confidence}%</span>
            </div>
            <div className="remediation-block">
              <span>Root cause</span>
              <p>{incident.rootCause}</p>
            </div>
            <div className="remediation-block">
              <span>Recommended action</span>
              <p>{incident.remediation}</p>
            </div>
            <div className="guardrail-note">
              <ShieldCheck size={15} />
              <span>
                <strong>Guardrails passed</strong>
                Static analysis, regression scope, and deployment policy verified.
              </span>
            </div>
          </section>

          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span><Code2 size={14} /> Terminal patch command</span>
            </div>
            <div className="command-block">
              <code><span>$</span> {incident.patch}</code>
              <button onClick={() => void copyPatch()} type="button" aria-label="Copy patch command">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </section>
        </div>

        <div className="drawer-footer">
          <button className="button button-ghost" onClick={onClose} type="button">
            Close
          </button>
          <button className="button button-primary" type="button">
            <GitBranchIcon /> Open hotfix pull request <ExternalLink size={14} />
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function GitBranchIcon() {
  return <Zap size={14} />;
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="Loading control center">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-metrics">
        {[0, 1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}
      </div>
      <div className="skeleton-charts">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
      <div className="skeleton-board">
        {[0, 1, 2].map((item) => <div className="skeleton-card" key={item} />)}
      </div>
    </div>
  );
}

export function ControlCenter() {
  const [tenantId, setTenantId] = useState("northstar");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);

  const query = useQuery({
    queryKey: ["dashboard", tenantId],
    queryFn: () => fetchDashboard(tenantId),
  });

  const incidentsByStatus = useMemo(() => {
    const grouped: Record<IncidentStatus, Incident[]> = {
      unresolved: [],
      analysing: [],
      resolved: [],
    };
    query.data?.incidents.forEach((incident) => grouped[incident.status].push(incident));
    return grouped;
  }, [query.data]);

  return (
    <div className="dashboard-shell">
      <button
        className="mobile-menu-button"
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <Logo />
          <button className="sidebar-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <PanelLeftClose size={17} />
          </button>
        </div>

        <div className="tenant-switcher-wrap">
          <button
            className="tenant-switcher"
            type="button"
            onClick={() => setTenantMenuOpen((value) => !value)}
            aria-expanded={tenantMenuOpen}
          >
            <span className="tenant-avatar">{tenantId === "northstar" ? "N" : "A"}</span>
            <span>
              <strong>{tenantId === "northstar" ? "Northstar Labs" : "Acme Cloud"}</strong>
              <small>Production workspace</small>
            </span>
            <ChevronDown size={14} />
          </button>
          {tenantMenuOpen && (
            <div className="tenant-menu">
              {[
                ["northstar", "Northstar Labs"],
                ["acme", "Acme Cloud"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setTenantId(id);
                    setTenantMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>{label.charAt(0)}</span>
                  {label}
                  {tenantId === id && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <span className="nav-section-label">Workspace</span>
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button className={"active" in item && item.active ? "active" : ""} key={item.label} type="button">
                <Icon size={16} />
                <span>{item.label}</span>
                {"badge" in item && <em>{item.badge}</em>}
              </button>
            );
          })}
          <span className="nav-section-label">Manage</span>
          {navItems.slice(3).map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button">
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-usage">
          <div>
            <span>LOG VOLUME</span>
            <strong>184 GB <small>/ 250 GB</small></strong>
          </div>
          <div className="usage-track"><span /></div>
          <p>74% of monthly telemetry allowance</p>
        </div>

        <div className="sidebar-user">
          <span className="user-avatar"><UserRound size={15} /></span>
          <span><strong>Alex Morgan</strong><small>Engineering Lead</small></span>
          <MoreHorizontal size={16} />
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} type="button" aria-label="Close navigation" />}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <span>Operations</span><ChevronRightIcon /> <strong>Control Center</strong>
          </div>
          <div className="topbar-actions">
            <button className="search-button" type="button"><Search size={14} /> Search incidents <kbd>⌘ K</kbd></button>
            <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={17} /><span /></button>
            <Link className="icon-button" href="/" aria-label="Back to DevPulse home"><ArrowLeft size={17} /></Link>
          </div>
        </header>

        {query.isLoading && <DashboardSkeleton />}

        {query.isError && (
          <div className="dashboard-error">
            <AlertTriangle size={20} />
            <div><strong>Control Center unavailable</strong><p>{query.error.message}</p></div>
            <button className="button button-ghost" onClick={() => void query.refetch()} type="button">Try again</button>
          </div>
        )}

        {query.data && (
          <motion.main className="dashboard-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="dashboard-heading">
              <div>
                <div className="dashboard-context">Tenant telemetry · {query.data.tenant.region}</div>
                <h1>Control Center</h1>
                <p>Incident intelligence across {query.data.tenant.name}.</p>
              </div>
              <div className="dashboard-heading-actions">
                <button className="button button-ghost" type="button"><FileKey2 size={14} /> Ingestion keys</button>
                <button className="button button-primary" type="button"><Zap size={14} /> Run diagnosis</button>
              </div>
            </div>

            <section className="metric-grid" aria-label="Key system metrics">
              <MetricCard label="Active Exceptions" value={String(query.data.metrics.activeExceptions)} detail="12%" tone="red" icon={AlertTriangle} />
              <MetricCard label="Avg Resolution Speed" value={query.data.metrics.averageResolution} detail="31%" tone="purple" icon={Clock3} />
              <MetricCard label="System Health SLA" value={`${query.data.metrics.systemHealth}%`} detail="0.04%" tone="green" icon={Gauge} />
              <MetricCard label="AI Patches Deployed" value={String(query.data.metrics.patchesDeployed)} detail="24 this week" tone="blue" icon={Sparkles} />
            </section>

            <section className="analytics-grid" aria-label="Telemetry analytics">
              <article className="chart-card">
                <div className="chart-card-heading">
                  <div><span>Inbound Exception Volumes</span><strong>26 <small>/ min</small></strong></div>
                  <span className="chart-change negative"><ArrowDownRight size={12} /> 18.4%</span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={query.data.charts} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="exceptionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#1e1e22" strokeDasharray="3 3" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#65656d", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#65656d", fontSize: 10 }} />
                      <Tooltip cursor={{ stroke: "#3f3f46", strokeDasharray: "3 3" }} content={<ChartTooltip unit="" />} />
                      <Area type="monotone" dataKey="exceptions" stroke="#9f7aea" strokeWidth={2} fill="url(#exceptionGradient)" activeDot={{ r: 4, fill: "#c4b5fd", stroke: "#060606", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="chart-card">
                <div className="chart-card-heading">
                  <div><span>Global Microservice Latency</span><strong>157 <small>ms p95</small></strong></div>
                  <span className="chart-change positive"><ArrowDownRight size={12} /> 7.2%</span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={query.data.charts} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#1e1e22" strokeDasharray="3 3" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#65656d", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#65656d", fontSize: 10 }} />
                      <Tooltip cursor={{ stroke: "#3f3f46", strokeDasharray: "3 3" }} content={<ChartTooltip unit="ms" />} />
                      <Area type="monotone" dataKey="latency" stroke="#34d399" strokeWidth={2} fill="url(#latencyGradient)" activeDot={{ r: 4, fill: "#6ee7b7", stroke: "#060606", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="incident-board-section">
              <div className="board-heading">
                <div><h2>Incident stream</h2><p>AI-assisted workflow across the active production surface.</p></div>
                <div className="board-legend"><span><i className="legend-red" /> Critical</span><span><i className="legend-amber" /> Analysing</span><span><i className="legend-green" /> Resolved</span></div>
              </div>
              <div className="incident-board">
                {columns.map((column) => (
                  <div className="kanban-column" key={column.id}>
                    <div className="kanban-heading">
                      <div><span className={`column-dot dot-${column.color}`} /><strong>{column.label}</strong><em>{incidentsByStatus[column.id].length}</em></div>
                      <span>{column.description}</span>
                    </div>
                    <div className="kanban-list">
                      {incidentsByStatus[column.id].map((incident) => (
                        <IncidentCard incident={incident} key={incident.id} onOpen={setSelectedIncident} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.main>
        )}
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentDrawer incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRightIcon() {
  return <span className="breadcrumb-separator">/</span>;
}
