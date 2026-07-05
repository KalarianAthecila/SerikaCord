"use client";

import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { MoeActivity } from "@/hooks/useMoeActivity";

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0 ? `${h}:${mm}:${String(sec).padStart(2, "0")}` : `${mm}:${String(sec).padStart(2, "0")}`;
}

function subtitle(activity: MoeActivity): string {
  const parts: string[] = [];
  if (activity.seasonNumber != null && activity.episodeNumber != null) {
    parts.push(`S${activity.seasonNumber}·E${activity.episodeNumber}`);
  } else if (activity.episodeNumber != null) {
    parts.push(`Episode ${activity.episodeNumber}`);
  }
  if (activity.episodeName) parts.push(activity.episodeName);
  return parts.join(" — ");
}

/**
 * Discord-Spotify-style "Watching on serika.moe" activity card.
 *
 * Ticks the progress bar locally between server polls so it feels live, and
 * pauses ticking when the stream is paused.
 */
export function NowWatchingCard({ activity }: { activity: MoeActivity }) {
  const duration = activity.durationSeconds ?? 0;

  // Estimate current progress: server progress + elapsed since last update
  // (unless paused). Recomputed whenever a fresh activity arrives.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => setElapsed(0), [activity.updatedAt, activity.progressSeconds]);

  useEffect(() => {
    if (activity.isPaused) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [activity.isPaused, activity.updatedAt]);

  const current = Math.min(
    activity.progressSeconds + (activity.isPaused ? 0 : elapsed),
    duration || Number.MAX_SAFE_INTEGER
  );
  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const line2 = subtitle(activity);

  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
      <h4 className="text-[11px] font-bold text-[#9a9aad] uppercase tracking-wide mb-2 flex items-center gap-1.5">
        {activity.isPaused ? (
          <Pause className="w-3 h-3 text-[#8B5CF6]" />
        ) : (
          <Play className="w-3 h-3 text-[#8B5CF6] fill-[#8B5CF6]" />
        )}
        Watching on serika.moe
      </h4>

      <div className="flex gap-3">
        {activity.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.posterUrl}
            alt={activity.titleName}
            className="w-12 h-16 rounded-md object-cover shrink-0 border border-white/[0.06]"
          />
        ) : (
          <div className="w-12 h-16 rounded-md shrink-0 bg-gradient-to-br from-[#8B5CF6] to-[#4F46E5]" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate" title={activity.titleName}>
            {activity.titleName}
          </p>
          {line2 && <p className="text-xs text-[#c8c8d8] truncate mt-0.5" title={line2}>{line2}</p>}

          {duration > 0 && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8B5CF6] transition-[width] duration-1000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#9a9aad] mt-1 tabular-nums">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
