"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizes = {
  sm: { icon: 24, full: { width: 100, height: 15 } },
  md: { icon: 32, full: { width: 150, height: 22 } },
  lg: { icon: 48, full: { width: 200, height: 30 } },
  xl: { icon: 64, full: { width: 300, height: 45 } },
};

export function Logo({ 
  className, 
  variant = "full", 
  size = "md",
  showText = true 
}: LogoProps) {
  const sizeConfig = sizes[size];

  if (variant === "icon") {
    return (
      <div className={cn("relative", className)}>
        <Image
          src="/logo-icon.svg"
          alt="SerikaCord"
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          priority
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span className={cn(
        "font-extrabold tracking-tight",
        size === "sm" && "text-lg",
        size === "md" && "text-xl",
        size === "lg" && "text-2xl",
        size === "xl" && "text-4xl",
        className
      )}>
        <span className="text-white">Serika</span>
        <span className="text-[#8b5cf6]">Cord</span>
      </span>
    );
  }

  // Full logo
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo-icon.svg"
        alt="SerikaCord"
        width={sizeConfig.icon}
        height={sizeConfig.icon}
        priority
        className="object-contain"
      />
      {showText && (
        <span className={cn(
          "font-extrabold tracking-tight",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl",
          size === "xl" && "text-4xl",
        )}>
          <span className="text-white">Serika</span>
          <span className="text-[#8b5cf6]">Cord</span>
        </span>
      )}
    </div>
  );
}

// Simple inline logo SVG for places where we can't use Next/Image
export function LogoInline({ 
  className,
  size = 24,
}: { 
  className?: string;
  size?: number;
}) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 48 48"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logoGrad)"/>
      <text x="24" y="34" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="800" fill="#ffffff" textAnchor="middle">S</text>
    </svg>
  );
}
