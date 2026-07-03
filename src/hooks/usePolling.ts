"use client";

import { useEffect, useRef } from "react";

/**
 * Visibility-aware polling: runs `fn` immediately, then on an interval while
 * the tab is visible. Pauses in background tabs and re-fires the moment the
 * tab regains visibility/focus, so data feels live without wasted requests.
 *
 * Pass `enabled: false` (or interval <= 0) to stop polling entirely.
 */
export function usePolling(
  fn: () => void,
  intervalMs: number,
  enabled = true,
  /** Re-runs immediately (and restarts the interval) when this changes. */
  key?: unknown
) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let timer: NodeJS.Timeout | null = null;

    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => fnRef.current(), intervalMs);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fnRef.current();
        start();
      } else {
        stop();
      }
    };

    fnRef.current();
    if (document.visibilityState === "visible") start();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
     
  }, [intervalMs, enabled, key]);
}
