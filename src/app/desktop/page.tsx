"use client";

import { useEffect, useState } from "react";
import { Monitor, Download, Apple, ExternalLink, Check, Loader2, Globe } from "lucide-react";
import Link from "next/link";

// Platform detection
type Platform = 'windows' | 'mac' | 'linux' | 'unknown';

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
}

const platformInfo = {
  windows: {
    name: 'Windows',
    icon: '🪟',
    downloadUrl: '#', // Would be actual download URL
    instructions: 'Download and run the installer',
  },
  mac: {
    name: 'macOS',
    icon: '🍎',
    downloadUrl: '#',
    instructions: 'Download the .dmg file and drag to Applications',
  },
  linux: {
    name: 'Linux',
    icon: '🐧',
    downloadUrl: '#',
    instructions: 'Download the AppImage or .deb package',
  },
  unknown: {
    name: 'Desktop',
    icon: '💻',
    downloadUrl: '#',
    instructions: 'Download the appropriate version for your system',
  },
};

export default function DesktopPage() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt (for PWA)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    
    setIsInstalling(true);
    // @ts-expect-error - prompt exists on BeforeInstallPromptEvent
    deferredPrompt.prompt();
    // @ts-expect-error - userChoice exists on BeforeInstallPromptEvent
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setIsInstalling(false);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const currentPlatform = platformInfo[platform];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">SerikaCord</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/mobile"
              className="text-sm text-[#888888] hover:text-white transition-colors"
            >
              Mobile App
            </Link>
            <Link
              href="/channels/me"
              className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
            >
              Open Web App →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Icon */}
          <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-2xl shadow-[#8B5CF6]/30">
            <Monitor className="w-14 h-14 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SerikaCord for Desktop
          </h1>
          <p className="text-lg text-[#b5bac1] mb-10 max-w-xl mx-auto">
            Get the full SerikaCord experience on your desktop. 
            Enjoy faster performance, system notifications, and a native feel.
          </p>

          {/* Download Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Native App (Coming Soon) */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 text-left relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium rounded">
                Coming Soon
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-2xl">
                  {currentPlatform.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Native App</h3>
                  <p className="text-[#888888] text-sm">For {currentPlatform.name}</p>
                </div>
              </div>
              <p className="text-[#666666] text-sm mb-4">
                {currentPlatform.instructions}
              </p>
              <button
                disabled
                className="w-full py-3 px-4 bg-[#222222] text-[#666666] font-medium rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download for {currentPlatform.name}
              </button>
            </div>

            {/* PWA Option */}
            <div className="bg-[#111111] border border-[#8B5CF6]/30 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Web App (PWA)</h3>
                  <p className="text-[#888888] text-sm">Available Now</p>
                </div>
              </div>
              <p className="text-[#b5bac1] text-sm mb-4">
                Install as a Progressive Web App for a near-native experience with auto-updates.
              </p>
              
              {isInstalled ? (
                <div className="w-full py-3 px-4 bg-[#248046]/20 text-[#57F287] font-medium rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Installed
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstallPWA}
                  disabled={isInstalling}
                  className="w-full py-3 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Install Web App
                    </>
                  )}
                </button>
              ) : (
                <a
                  href="https://waifu.ws/channels/me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open waifu.ws
                </a>
              )}
            </div>
          </div>

          {/* All Platforms */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">All Platforms</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['windows', 'mac', 'linux'] as const).map((p) => (
                <button
                  key={p}
                  disabled
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] transition-colors cursor-not-allowed opacity-50"
                >
                  <span className="text-3xl">{platformInfo[p].icon}</span>
                  <span className="text-white text-sm font-medium">{platformInfo[p].name}</span>
                  <span className="text-[#666666] text-xs">Coming Soon</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#1a1a1a] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Why use the Desktop App?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "System Notifications",
                desc: "Get notified about new messages even when the app is minimized.",
                icon: "🔔",
              },
              {
                title: "Keyboard Shortcuts",
                desc: "Navigate quickly with keyboard shortcuts designed for power users.",
                icon: "⌨️",
              },
              {
                title: "Better Performance",
                desc: "Optimized for desktop with faster loading and smoother animations.",
                icon: "⚡",
              },
              {
                title: "Always Accessible",
                desc: "Launch from your taskbar or dock for instant access.",
                icon: "📌",
              },
              {
                title: "Cross-Platform",
                desc: "Available for Windows, macOS, and Linux.",
                icon: "💻",
              },
              {
                title: "Auto Updates",
                desc: "Always get the latest features automatically.",
                icon: "🔄",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#111111] border border-[#222222] rounded-xl p-5"
              >
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-[#888888] text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-6 text-center">
        <p className="text-[#666666] text-sm">
          © 2026 SerikaCord. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
