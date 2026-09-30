/**
 * api-client.ts — typed fetch wrappers for the AEGISFLOW API.
 * All calls are relative to NEXT_PUBLIC_API_URL.
 */

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE = RAW_BASE.replace(/\/+$/, "");

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${BASE}${cleanPath}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${cleanPath} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Endpoints ────────────────────────────────────────────────────────

export async function fetchZoneRisk() {
  return apiFetch<{ type: "FeatureCollection"; features: any[] }>("/risk/zones");
}

export async function fetchZoneSitrep(zoneId: string) {
  return apiFetch<{
    zone_id: string;
    risk_level: string;
    summary: string;
    recommended_action: string;
    confidence: number;
    evidence: Record<string, any>;
    generated_at: string;
    model: string;
  }>(`/risk/sitrep/${encodeURIComponent(zoneId)}`);
}

export async function fetchIncidents() {
  return apiFetch<any[]>("/incidents");
}

export async function fetchIncident(id: string) {
  return apiFetch<any>(`/incidents/${encodeURIComponent(id)}`);
}

export async function fetchShelters() {
  return apiFetch<any[]>("/resources/shelters");
}

export async function fetchTeams() {
  return apiFetch<any[]>("/resources/teams");
}

export async function fetchAlerts() {
  return apiFetch<any[]>("/alerts/");
}

export async function fetchEvents() {
  return apiFetch<any[]>("/events");
}

export async function submitReport(data: {
  lat: number;
  lng: number;
  text: string;
  depth_hint?: "ankle" | "knee" | "waist+" | null;
  image_url?: string | null;
  source?: string;
}) {
  return apiFetch<any>("/reports/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function computeEvacuationRoute(data: {
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}) {
  return apiFetch<any>("/routes/evacuation", {
    method: "POST",
    body: JSON.stringify({
      from_lat: data.from_lat,
      from_lng: data.from_lng,
      to_lat: data.to_lat,
      to_lng: data.to_lng,
    }),
  });
}

export async function allocateResources(incident_ids: string[]) {
  return apiFetch<{ assignments: any[]; message?: string }>("/allocate/", {
    method: "POST",
    body: JSON.stringify({ incident_ids }),
  });
}

export async function approveAlert(alertId: string, approvedBy: string = "Command Officer 1") {
  await apiFetch<any>(`/alerts/${encodeURIComponent(alertId)}/approve`, {
    method: "POST",
    body: JSON.stringify({ approved_by: approvedBy }),
  });
  return apiFetch<any>(`/alerts/${encodeURIComponent(alertId)}/send`, {
    method: "POST",
    body: JSON.stringify({ approved_by: approvedBy }),
  });
}

export async function rejectAlert(alertId: string, approvedBy: string = "Command Officer 1") {
  return apiFetch<any>(`/alerts/${encodeURIComponent(alertId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ approved_by: approvedBy }),
  });
}

export async function simulateRain(intensity_mm_h: number) {
  return apiFetch<any>("/simulate/rain", {
    method: "POST",
    body: JSON.stringify({ intensity_mm_h }),
  });
}

export async function simulateReports(count: number = 23, zone_id?: string) {
  return apiFetch<any>("/simulate/reports", {
    method: "POST",
    body: JSON.stringify({ count, zone_id }),
  });
}

export async function simulateBlockRoad(reason: string = "flooding") {
  return apiFetch<any>("/simulate/block-road", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function simulateReset() {
  return apiFetch<any>("/simulate/reset", {
    method: "POST",
  });
}

export async function fetchSimulatorState() {
  return apiFetch<any>("/simulate/state");
}

export async function chatWithAegis(
  messages: { role: "user" | "assistant"; content: string }[],
  pageContext?: string
) {
  return apiFetch<{
    reply: string;
    model_used: string;
    rate_limit_remaining: number;
  }>("/chat/", {
    method: "POST",
    body: JSON.stringify({ messages, page_context: pageContext }),
  });
}
