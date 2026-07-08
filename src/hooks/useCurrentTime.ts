"use client";

import { useEffect, useState } from "react";

/**
 * Localized "now" for a timezone, computed client-side only so it never causes
 * a hydration mismatch (server clock !== client clock). Returns null until
 * mounted, then refreshes every minute so the displayed time stays current.
 */
export function useCurrentTime(timeZone?: string | null): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (!timeZone) {
      setTime(null);
      return;
    }
    const update = () => {
      try {
        setTime(
          new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone,
          })
        );
      } catch {
        setTime(null);
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}
