"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";
import { cn } from "@/lib/utils";

interface TwemojiProps {
  children: React.ReactNode;
  className?: string;
  size?: "normal" | "large";
}

// Check if a string contains only emoji characters
function isOnlyEmoji(text: string): boolean {
  // Remove whitespace and check if remaining chars are emojis
  const stripped = text.replace(/\s/g, "");
  const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+$/u;
  return emojiRegex.test(stripped) && stripped.length <= 12;
}

export function Twemoji({ children, className, size = "normal" }: TwemojiProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, {
        folder: "svg",
        ext: ".svg",
        className: "emoji",
      });
    }
  }, [children]);

  // Auto-detect large emojis if the content is only emojis
  const autoSize = typeof children === "string" && isOnlyEmoji(children) ? "large" : size;
  const sizeClass = autoSize === "large" ? "twemoji-large" : "twemoji";

  return (
    <span ref={ref} className={cn(sizeClass, className)}>
      {children}
    </span>
  );
}
