"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WsMessage, WsConnectionStatus } from "@aegisflow/shared";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/events";

/**
 * useEvents — subscribes to WS /ws/events and delivers typed DomainEvent messages.
 * Reconnects automatically on disconnect (exponential backoff, max 30s).
 */
export function useEvents(
  onMessage?: (msg: WsMessage) => void
): { status: WsConnectionStatus } {
  const [status, setStatus] = useState<WsConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      retryDelay.current = 1000; // reset backoff
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;
        onMessageRef.current?.(msg);
      } catch {
        console.warn("[useEvents] failed to parse WS message", event.data);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      const delay = Math.min(retryDelay.current, 30_000);
      retryDelay.current = delay * 2;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      setStatus("error");
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
}
