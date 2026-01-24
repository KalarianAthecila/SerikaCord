"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, MessageSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface BottomNavigationProps {
  activeTab?: string;
  notificationCount?: number;
  messageCount?: number;
}

export function BottomNavigation({ 
  notificationCount = 0, 
  messageCount = 0 
}: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Servers", 
      href: "/channels/me",
    },
    { 
      icon: MessageSquare, 
      label: "Messages", 
      href: "/channels/messages",
      badge: messageCount,
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      href: "/channels/notifications",
      badge: notificationCount,
    },
    { 
      icon: User, 
      label: "You", 
      href: "/channels/profile",
    },
  ];

  const getIsActive = (href: string) => {
    if (href === "/channels/me") {
      return pathname === "/channels/me" || pathname?.startsWith("/channels/") && !pathname.includes("messages") && !pathname.includes("notifications") && !pathname.includes("profile");
    }
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[60px] px-2">
        {navItems.map((item) => {
          const isActive = getIsActive(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 active:scale-95",
                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-400"
              )}
            >
              <div className={cn("relative p-1 rounded-xl transition-colors", isActive && "bg-[#8B5CF6]/20")}>
                <Icon className={cn("w-6 h-6 transition-colors", isActive && "text-[#8B5CF6]")} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ED4245] text-white text-[10px] font-bold rounded-full border-2 border-black">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-[#8B5CF6]" : "text-neutral-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
