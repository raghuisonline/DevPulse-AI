import type { Metadata } from "next";
import { ControlCenter } from "@/components/dashboard/control-center";

export const metadata: Metadata = {
  title: "Control Center",
  description: "Multi-tenant incident telemetry and AI remediation console.",
};

export default function DashboardPage() {
  return <ControlCenter />;
}
