"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";

interface TwemojiProps {
  children: React.ReactNode;
  className?: string;
}

export function Twemoji({ children, className }: TwemojiProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, {
        folder: "svg",
        ext: ".svg",
      });
    }
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
