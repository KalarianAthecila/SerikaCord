"use client";

import { useEffect, useState } from "react";
import { Smartphone, Download, Chrome, Apple, ExternalLink, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MobilePage() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">SerikaCord</span>
          </Link>
          <Link
            href="/channels/me"
            className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
          >
            Open Web App →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
            <Smartphone className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            SerikaCord for Mobile
          </h1>
          <p className="text-[#b5bac1] mb-8">
            Install SerikaCord on your device for the best mobile experience. 
            Access your servers and messages from anywhere.
          </p>

          {/* Install Status */}
          {isInstalled ? (
            <div className="bg-[#248046]/20 border border-[#248046]/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 text-[#57F287] mb-2">
                <Check className="w-6 h-6" />
                <span className="text-lg font-semibold">App Installed!</span>
              </div>
              <p className="text-[#b5bac1] text-sm">
                SerikaCord is installed on your device. Open it from your home screen.
              </p>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full py-4 px-6 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 mb-8"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Install SerikaCord
                </>
              )}
            </button>
          ) : (
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
              <p className="text-[#888888] text-sm mb-4">
                To install SerikaCord on your mobile device:
              </p>
              <div className="space-y-4 text-left">
                {/* iOS Instructions */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">iOS (Safari)</p>
                    <p className="text-[#888888] text-xs">
                      Tap the Share button → &quot;Add to Home Screen&quot;
                    </p>
                  </div>
                </div>
                {/* Android Instructions */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <Chrome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Android (Chrome)</p>
                    <p className="text-[#888888] text-xs">
                      Tap ⋮ menu → &quot;Add to Home screen&quot; or &quot;Install app&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { title: "Offline Support", desc: "Access cached messages" },
              { title: "Push Notifications", desc: "Never miss a message" },
              { title: "Fast & Light", desc: "Optimized for mobile" },
              { title: "Native Feel", desc: "Works like a native app" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-left"
              >
                <p className="text-white font-medium text-sm">{feature.title}</p>
                <p className="text-[#888888] text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Open in Browser */}
          <a
            href="https://waifu.ws/channels/me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open waifu.ws in browser</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-6 text-center">
        <p className="text-[#666666] text-sm">
          © 2026 SerikaCord. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
