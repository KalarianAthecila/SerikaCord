"use client";

import { useState, useEffect, useCallback } from "react";

export interface ApplicationData {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  botId?: string;
  botPublic?: boolean;
  botRequireCodeGrant?: boolean;
  botToken?: string;
  clientSecret?: string;
  clientId?: string;
  redirectUris?: string[];
  scopes?: string[];
  verified?: boolean;
  serverCount?: number;
  teamId?: string;
  createdAt: string;
  tags?: string[];
  installParams?: {
    scopes?: string[];
    permissions?: string;
  };
  customInstallUrl?: string;
  emojiCount?: number;
  webhookCount?: number;
}

export function useApplication(appId: string) {
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch(`/api/developers/applications/${appId}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data.application || data);
      }
    } catch {
      // Demo mode — return mock data
      setApp({
        id: appId,
        name: "My Awesome Bot",
        description: "",
        clientId: appId,
        botId: appId,
        botPublic: false,
        botRequireCodeGrant: false,
        redirectUris: [],
        scopes: [],
        verified: false,
        serverCount: 0,
        createdAt: new Date().toISOString(),
        tags: [],
        emojiCount: 0,
        webhookCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchApp();
  }, [fetchApp]);

  const saveApp = async (patch: Partial<ApplicationData>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/developers/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        setApp((prev) => ({ ...prev, ...data.application, ...patch }));
      }
      setApp((prev) => (prev ? { ...prev, ...patch } : prev));
    } catch {
      setApp((prev) => (prev ? { ...prev, ...patch } : prev));
    } finally {
      setSaving(false);
    }
  };

  return { app, loading, saving, saveApp, refetch: fetchApp };
}
