"use client";

import { useEffect, useState } from "react";

export interface MoeActivity {
  titleName: string;
  episodeName: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  progressSeconds: number;
  durationSeconds: number | null;
  posterUrl: string | null;
  isPaused: boolean;
  startedAt: string;
  updatedAt: string;
}

/**
 * Polls a user's live "now watching on serika.moe" activity.
 *
 * Returns null when the user isn't linked / isn't watching. Polls every
 * `intervalMs` (default 30s) while `enabled`; the server already caches per
 * account so this stays cheap even with many mounted cards.
 */
export function useMoeActivity(
  userId: string | undefined | null,
  { enabled = true, intervalMs = 30_000 }: { enabled?: boolean; intervalMs?: number } = {}
): MoeActivity | null {
  const [activity, setActivity] = useState<MoeActivity | null>(null);

  useEffect(() => {
    if (!userId || !enabled) {
      setActivity(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/activity`, { signal: controller.signal });
        if (!active || !res.ok) return;
        const data = (await res.json()) as { activity?: MoeActivity | null };
        if (active) setActivity(data.activity ?? null);
      } catch {
        // ignore transient errors; keep last known value
      }
    };

    void load();
    const timer = setInterval(load, intervalMs);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
    };
  }, [userId, enabled, intervalMs]);

  return activity;
}
