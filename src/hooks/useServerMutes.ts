"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-side per-server mute state, persisted in localStorage (no backend
 * cost). A muted server suppresses its unread/mention badge in the sidebar.
 * Syncs across tabs via the `storage` event.
 */
const MUTE_KEY = "server-mutes";

function readMutes(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(MUTE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeMutes(set: Set<string>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(MUTE_KEY, JSON.stringify([...set]));
}

export function useServerMutes() {
  const [muted, setMuted] = useState<Set<string>>(() => readMutes());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MUTE_KEY) setMuted(readMutes());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isMuted = useCallback((serverId: string) => muted.has(serverId), [muted]);

  const toggleMute = useCallback((serverId: string) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) next.delete(serverId);
      else next.add(serverId);
      writeMutes(next);
      return next;
    });
  }, []);

  return { isMuted, toggleMute };
}
