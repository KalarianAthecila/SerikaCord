"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  text: string;
  className?: string;
}

/**
 * Animated "X is typing..." row. Occupies a CONSTANT height whether or not
 * anyone is typing, so the message list above it never resizes/shifts when the
 * indicator appears or disappears — only the content fades in and out.
 */
export function TypingIndicator({ text, className }: TypingIndicatorProps) {
  return (
    <div
      aria-hidden={!text}
      className={cn(
        "px-4 h-5 flex items-center overflow-hidden transition-opacity duration-150",
        text ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 text-xs text-[var(--app-muted)]">
        <span className="flex gap-0.5 items-center">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)] animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)] animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)] animate-bounce [animation-delay:300ms]" />
        </span>
        <span className="font-medium">{text}</span>
      </span>
    </div>
  );
}
