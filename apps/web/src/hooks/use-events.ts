"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WsMessage, WsConnectionStatus } from "@aegisflow/shared";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/events";

/**
 * useEvents — subscribes to WS /ws/events and delivers typed DomainEvent messages.
 * Reconnects automatically on disconnect with exponential backoff (max 30s).
 * Cleans up all pending timers and sockets on unmount to prevent ghost connections.
 */
export function useEvents(
  onMessage?: (msg: WsMessage) => void
): { status: WsConnectionStatus; reconnect: () => void } {
  const [status, setStatus] = useState<WsConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        setStatus("connected");
        retryDelay.current = 1000; // reset backoff
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          onMessageRef.current?.(msg);
        } catch {
          console.warn("[useEvents] failed to parse WS message", event.data);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setStatus("disconnected");
        const delay = Math.min(retryDelay.current, 30_000);
        retryDelay.current = delay * 2;
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connectRef.current();
          }
        }, delay);
      };

      ws.onerror = () => {
        if (!isMountedRef.current) return;
        setStatus("error");
        ws.close();
      };
    } catch (_err) {
      if (!isMountedRef.current) return;
      setStatus("error");
      const delay = Math.min(retryDelay.current, 30_000);
      retryDelay.current = delay * 2;
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          connectRef.current();
        }
      }, delay);
    }
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);


  const reconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
    }
    retryDelay.current = 1000;
    connect();
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { status, reconnect };
}
