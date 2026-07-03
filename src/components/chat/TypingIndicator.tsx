"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  text: string;
  className?: string;
}

/** Animated "X is typing..." row; collapses smoothly when text is empty. */
export function TypingIndicator({ text, className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "px-4 overflow-hidden transition-all duration-200",
        text ? "py-1.5 max-h-8 opacity-100" : "py-0 max-h-0 opacity-0",
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
