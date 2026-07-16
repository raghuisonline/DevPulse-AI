import { getDashboardPayload } from "@/lib/incidents";

export const runtime = "edge";

export async function GET(request: Request) {
  const tenantId = request.headers.get("x-devpulse-tenant") ?? "northstar";

  return Response.json(getDashboardPayload(tenantId), {
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      Vary: "x-devpulse-tenant",
    },
  });
}
