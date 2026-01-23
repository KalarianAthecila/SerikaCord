"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ServerProvider } from "@/contexts/ServerContext";
import { ServerSidebar } from "@/components/layout/ServerSidebar";
import { ChannelSidebar } from "@/components/layout/ChannelSidebar";
import { CreateServerDialog } from "@/components/dialogs/CreateServerDialog";
import { CreateChannelDialog } from "@/components/dialogs/CreateChannelDialog";
import { UserSettingsDialog } from "@/components/dialogs/UserSettingsDialog";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#000000] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-[#8B5CF6] flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
              <span className="text-lg font-medium text-white">Loading SerikaCord...</span>
            </div>
            <p className="text-sm text-[#666666]">Preparing your experience</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#000000] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <div className="w-16 h-16 rounded-xl bg-[#8B5CF6] flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to SerikaCord</h1>
            <p className="text-[#666666] max-w-md">
              Sign in to access your servers, chat with friends, and join communities.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-white font-medium rounded-md transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ChannelsContent({ children }: { children: React.ReactNode }) {
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Touch handling for swipe gestures
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Listen for custom events from UserPanel
  useEffect(() => {
    const handleOpenSettings = () => setShowUserSettings(true);
    window.addEventListener('openUserSettings', handleOpenSettings);
    return () => window.removeEventListener('openUserSettings', handleOpenSettings);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    const handleRouteChange = () => setMobileMenuOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Swipe gesture handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only on mobile
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || !isDragging) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    
    // Only allow dragging in the right direction
    if (mobileMenuOpen) {
      // Can only swipe left to close
      if (diff < 0) {
        setDragOffset(Math.max(diff, -312)); // -312 = sidebar width (72 + 240)
      }
    } else {
      // Can only swipe right to open, from left edge
      if (diff > 0 && touchStartX.current < 30) {
        setDragOffset(Math.min(diff, 312));
      }
    }
  }, [isDragging, mobileMenuOpen]);

  const handleTouchEnd = useCallback(() => {
    if (window.innerWidth >= 768) return;
    setIsDragging(false);
    
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 100;
    
    if (mobileMenuOpen) {
      // Close if swiped left enough
      if (diff < -threshold) {
        setMobileMenuOpen(false);
      }
    } else {
      // Open if swiped right enough from left edge
      if (diff > threshold && touchStartX.current < 30) {
        setMobileMenuOpen(true);
      }
    }
    
    setDragOffset(0);
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [mobileMenuOpen]);

  // Calculate sidebar position during drag
  const getSidebarTransform = useCallback(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.innerWidth >= 768) return undefined;
    
    if (isDragging && dragOffset !== 0) {
      if (mobileMenuOpen) {
        return `translateX(${dragOffset}px)`;
      } else {
        return `translateX(${-312 + dragOffset}px)`;
      }
    }
    return mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)';
  }, [isDragging, dragOffset, mobileMenuOpen]);

  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex h-screen bg-[#0a0a0a] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Combined Sidebars for mobile swipe */}
      <div 
        className={cn(
          "fixed md:relative z-40 h-full flex md:translate-x-0",
          !isDragging && "transition-transform duration-200"
        )}
        style={isMobile ? { transform: getSidebarTransform() } : undefined}
      >
        <ServerSidebar onCreateServer={() => setShowCreateServer(true)} />
        <ChannelSidebar onCreateChannel={() => setShowCreateChannel(true)} />
      </div>

      {/* Swipe indicator for mobile - shows on left edge */}
      {isMobile && !mobileMenuOpen && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-20 bg-[#8B5CF6]/30 rounded-r-full z-50" />
      )}

      {/* Main Content */}
      <main className="flex-1 flex min-w-0">{children}</main>

      {/* Dialogs */}
      <CreateServerDialog
        open={showCreateServer}
        onOpenChange={setShowCreateServer}
      />
      <CreateChannelDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
      />
      <UserSettingsDialog
        open={showUserSettings}
        onOpenChange={setShowUserSettings}
      />
    </div>
  );
}

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ServerProvider>
        <AuthGate>
          <ChannelsContent>{children}</ChannelsContent>
        </AuthGate>
      </ServerProvider>
    </AuthProvider>
  );
}
