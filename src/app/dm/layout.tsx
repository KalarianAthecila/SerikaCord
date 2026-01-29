"use client";

import { useState, useEffect } from "react";
import { ServerSidebar } from "@/components/layout/ServerSidebar";
import { ChannelSidebar } from "@/components/layout/ChannelSidebar";
import { CreateServerDialog } from "@/components/dialogs/CreateServerDialog";
import { UserSettingsDialog } from "@/components/dialogs/UserSettingsDialog";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServerProvider, useServer } from "@/contexts/ServerContext";

function DMContent({ children }: { children: React.ReactNode }) {
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const { clearContext } = useServer();

  // Clear server context when entering DM layout
  useEffect(() => {
    clearContext();
  }, [clearContext]);

  useEffect(() => {
    const handleOpenSettings = () => setShowUserSettings(true);
    window.addEventListener('openUserSettings', handleOpenSettings);
    return () => window.removeEventListener('openUserSettings', handleOpenSettings);
  }, []);

  return (
    <div className="h-screen flex animate-fade-in">
      <ServerSidebar onCreateServer={() => setShowCreateServer(true)} />
      <ChannelSidebar />
      <main className="flex-1 flex min-w-0">{children}</main>
      <CreateServerDialog
        open={showCreateServer}
        onOpenChange={setShowCreateServer}
      />
      <UserSettingsDialog
        open={showUserSettings}
        onOpenChange={setShowUserSettings}
      />
    </div>
  );
}

export default function DMLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ServerProvider>
        <DMContent>{children}</DMContent>
      </ServerProvider>
    </AuthProvider>
  );
}
