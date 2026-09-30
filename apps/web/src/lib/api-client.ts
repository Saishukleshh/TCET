/**
 * api-client.ts — typed fetch wrappers for the AEGISFLOW API.
 * All calls are relative to NEXT_PUBLIC_API_URL.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Endpoints ────────────────────────────────────────────────────────

export async function fetchZoneRisk() {
  return apiFetch<{ type: "FeatureCollection"; features: any[] }>("/risk/zones");
}

export async function fetchIncidents() {
  return apiFetch<any[]>("/incidents");
}

export async function fetchIncident(id: string) {
  return apiFetch<any>(`/incidents/${id}`);
}

export async function fetchShelters() {
  return apiFetch<any[]>("/resources/shelters");
}

export async function fetchTeams() {
  return apiFetch<any[]>("/resources/teams");
}

export async function fetchAlerts() {
  return apiFetch<any[]>("/alerts");
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
    body: JSON.stringify(data),
  });
}

export async function allocateResources(incident_ids: string[]) {
  return apiFetch<{ assignments: any[]; message?: string }>("/allocate/", {
    method: "POST",
    body: JSON.stringify({ incident_ids }),
  });
}

export async function approveAlert(alertId: string, approvedBy: string = "Command Officer 1") {
  return apiFetch<any>(`/alerts/${alertId}/approve`, {
    method: "POST",
    body: JSON.stringify({ approved_by: approvedBy }),
  });
}

export async function rejectAlert(alertId: string, approvedBy: string = "Command Officer 1") {
  return apiFetch<any>(`/alerts/${alertId}/reject`, {
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
