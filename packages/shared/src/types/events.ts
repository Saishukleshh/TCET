/** Domain event kinds — used in the events table and WebSocket stream. */
export type EventKind =
  | "incident.created"
  | "incident.updated"
  | "risk.updated"
  | "route.recalculated"
  | "alert.pending"
  | "alert.approved"
  | "alert.sent"
  | "alert.rejected"
  | "resource.assigned"
  | "road.blocked"
  | "rain.updated"
  | "simulate.reset";

export interface DomainEvent<P = unknown> {
  id: string;
  ts: string; // ISO UTC
  kind: EventKind;
  payload: P;
}
