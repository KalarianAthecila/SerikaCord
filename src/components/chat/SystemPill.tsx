"use client";

import { cn } from "@/lib/utils";

interface SystemPillProps {
  isSystem?: boolean;
  className?: string;
}

export function SystemPill({ isSystem, className }: SystemPillProps) {
  if (!isSystem) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center self-center px-1 py-[2px] rounded text-[8px] font-bold leading-none bg-[#5865F2] text-white uppercase select-none shrink-0",
        className
      )}
    >
      SYSTEM
    </span>
  );
}
