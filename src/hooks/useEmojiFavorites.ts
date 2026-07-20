"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "serika-emoji-favorites";
const API_BASE = "/api/gifs";

export interface EmojiFavorite {
  emoji: string;
  name?: string;
  customEmojiId?: string | null;
  url?: string | null;
  addedAt: number;
}

export interface UseEmojiFavoritesReturn {
  favorites: EmojiFavorite[];
  isFavorite: (emoji: string, customEmojiId?: string) => boolean;
  addFavorite: (item: { emoji: string; name?: string; customEmojiId?: string; url?: string }) => void;
  removeFavorite: (emoji: string, customEmojiId?: string) => void;
  toggleFavorite: (item: { emoji: string; name?: string; customEmojiId?: string; url?: string }) => void;
  isReady: boolean;
}

function readLocalFavorites(): EmojiFavorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is EmojiFavorite =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as EmojiFavorite).emoji === "string"
        );
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function writeLocalFavorites(favs: EmojiFavorite[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
}

// ── Shared module-level store ────────────────────────────────────────────────
// `useEmojiFavorites` is called from *every* rendered message (MessageContent),
// so a per-hook implementation meant a channel with N messages fired N identical
// /emoji-favorites fetches and kept N copies of the list in memory. This store
// collapses all of that into a single fetch and a single array shared by every
// subscriber via useSyncExternalStore.
let favorites: EmojiFavorite[] = [];
let isReady = false;
let loadedForAuth: boolean | null = null; // auth state the current data was loaded for
let currentIsAuthenticated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getFavoritesSnapshot(): EmojiFavorite[] {
  return favorites;
}

function getReadySnapshot(): boolean {
  return isReady;
}

const EMPTY_FAVORITES: EmojiFavorite[] = [];
function getServerFavoritesSnapshot(): EmojiFavorite[] {
  return EMPTY_FAVORITES;
}
function getServerReadySnapshot(): boolean {
  return false;
}

function setFavorites(next: EmojiFavorite[]) {
  favorites = next;
  emit();
}

async function loadFromApi(): Promise<EmojiFavorite[] | null> {
  try {
    const res = await fetch(`${API_BASE}/emoji-favorites`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    const apiFavs = data.favorites as Array<Record<string, unknown>>;
    if (!Array.isArray(apiFavs)) return [];
    return apiFavs
      .filter((f) => f && typeof f.emoji === "string")
      .map((f) => ({
        emoji: String(f.emoji),
        name: f.name ? String(f.name) : undefined,
        customEmojiId: f.customEmojiId ? String(f.customEmojiId) : null,
        url: f.url ? String(f.url) : null,
        addedAt: Number(f.addedAt) || 0,
      })) as EmojiFavorite[];
  } catch {
    return null;
  }
}

// Load exactly once per auth state, shared across every hook instance.
function ensureLoaded(isAuthenticated: boolean) {
  currentIsAuthenticated = isAuthenticated;
  if (loadedForAuth === isAuthenticated) return;
  loadedForAuth = isAuthenticated;
  isReady = false;
  emit();

  if (!isAuthenticated) {
    setFavorites(readLocalFavorites());
    isReady = true;
    emit();
    return;
  }

  loadFromApi().then((apiFavs) => {
    // A logout may have raced ahead of this resolution — don't clobber it.
    if (loadedForAuth !== true) return;
    if (apiFavs === null) {
      setFavorites(readLocalFavorites());
    } else {
      setFavorites(apiFavs);
      const local = readLocalFavorites();
      const apiKeys = new Set(apiFavs.map((f) => f.customEmojiId || f.emoji));
      const toSync = local.filter((f) => !apiKeys.has(f.customEmojiId || f.emoji));
      if (toSync.length > 0) {
        Promise.all(
          toSync.map((f) =>
            fetch(`${API_BASE}/emoji-favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ emoji: f.emoji, name: f.name, customEmojiId: f.customEmojiId, url: f.url }),
            }).catch(() => null)
          )
        ).then(() => {
          if (loadedForAuth !== true) return;
          loadFromApi().then((merged) => {
            if (loadedForAuth === true && merged) setFavorites(merged);
          });
        });
        writeLocalFavorites([]);
      }
    }
    isReady = true;
    emit();
  });
}

function addFavoriteToStore(item: { emoji: string; name?: string; customEmojiId?: string; url?: string }) {
  if (!item.emoji) return;
  const key = item.customEmojiId || item.emoji;
  if (favorites.some((f) => (f.customEmojiId || f.emoji) === key)) return;
  setFavorites([{ ...item, addedAt: Date.now() }, ...favorites]);
  if (currentIsAuthenticated) {
    fetch(`${API_BASE}/emoji-favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji: item.emoji, name: item.name, customEmojiId: item.customEmojiId, url: item.url }),
    }).catch(() => {
      setFavorites(favorites.filter((f) => (f.customEmojiId || f.emoji) !== key));
    });
  } else {
    writeLocalFavorites(favorites);
  }
}

function removeFavoriteFromStore(emoji: string, customEmojiId?: string) {
  const key = customEmojiId || emoji;
  const removed = favorites.find((f) => (f.customEmojiId || f.emoji) === key);
  setFavorites(favorites.filter((f) => (f.customEmojiId || f.emoji) !== key));
  if (currentIsAuthenticated) {
    fetch(`${API_BASE}/emoji-favorites`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji, customEmojiId }),
    }).catch(() => {
      if (removed && !favorites.some((f) => (f.customEmojiId || f.emoji) === key)) {
        setFavorites([removed, ...favorites]);
      }
    });
  } else {
    writeLocalFavorites(favorites);
  }
}

export function useEmojiFavorites(): UseEmojiFavoritesReturn {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const favoritesState = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );
  const isReadyState = useSyncExternalStore(subscribe, getReadySnapshot, getServerReadySnapshot);

  useEffect(() => {
    ensureLoaded(isAuthenticated);
  }, [isAuthenticated]);

  const isFavorite = useCallback(
    (emoji: string, customEmojiId?: string) => {
      const key = customEmojiId || emoji;
      return favoritesState.some((f) => (f.customEmojiId || f.emoji) === key);
    },
    [favoritesState]
  );

  const addFavorite = useCallback(
    (item: { emoji: string; name?: string; customEmojiId?: string; url?: string }) => addFavoriteToStore(item),
    []
  );

  const removeFavorite = useCallback(
    (emoji: string, customEmojiId?: string) => removeFavoriteFromStore(emoji, customEmojiId),
    []
  );

  const toggleFavorite = useCallback(
    (item: { emoji: string; name?: string; customEmojiId?: string; url?: string }) => {
      if (isFavorite(item.emoji, item.customEmojiId)) {
        removeFavorite(item.emoji, item.customEmojiId);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return useMemo(
    () => ({ favorites: favoritesState, isFavorite, addFavorite, removeFavorite, toggleFavorite, isReady: isReadyState }),
    [favoritesState, isFavorite, addFavorite, removeFavorite, toggleFavorite, isReadyState]
  );
}
