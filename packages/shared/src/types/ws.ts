import type { DomainEvent } from "./events";

/** WebSocket message sent from the server on WS /ws/events */
export interface WsMessage<P = unknown> extends DomainEvent<P> {
  // inherited: id, ts, kind, payload
}

/** Connection state for UI components */
export type WsConnectionStatus = "connecting" | "connected" | "disconnected" | "error";
