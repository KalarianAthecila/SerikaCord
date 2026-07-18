"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "serika-gif-favorites";
const API_BASE = "/api/gifs";

export interface GifFavorite {
  url: string;
  title?: string;
  source?: string;
  addedAt: number;
}

export interface UseGifFavoritesReturn {
  favorites: GifFavorite[];
  isFavorite: (url: string) => boolean;
  addFavorite: (gif: { url: string; title?: string; source?: string }) => void;
  removeFavorite: (url: string) => void;
  toggleFavorite: (gif: { url: string; title?: string; source?: string }) => void;
  isReady: boolean;
}

function readLocalFavorites(): GifFavorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is GifFavorite =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as GifFavorite).url === "string"
        );
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function writeLocalFavorites(favs: GifFavorite[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
}

// ── Shared module-level store ────────────────────────────────────────────────
// A GifFavoriteButton is mounted for *every* GIF rendered in chat, so a per-hook
// implementation fired one /favorites fetch (and kept one array copy) per GIF on
// screen. This store collapses that to a single fetch and a single shared array.
let favorites: GifFavorite[] = [];
let isReady = false;
let loadedForAuth: boolean | null = null;
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

function getFavoritesSnapshot(): GifFavorite[] {
  return favorites;
}
function getReadySnapshot(): boolean {
  return isReady;
}

const EMPTY_FAVORITES: GifFavorite[] = [];
function getServerFavoritesSnapshot(): GifFavorite[] {
  return EMPTY_FAVORITES;
}
function getServerReadySnapshot(): boolean {
  return false;
}

function setFavorites(next: GifFavorite[]) {
  favorites = next;
  emit();
}

async function loadFromApi(): Promise<GifFavorite[] | null> {
  try {
    const res = await fetch(`${API_BASE}/favorites`, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    const apiFavs = data.favorites as Array<Record<string, unknown>>;
    if (!Array.isArray(apiFavs)) return [];
    return apiFavs
      .filter((f) => f && typeof f.url === "string")
      .map((f) => ({
        url: String(f.url),
        title: f.title ? String(f.title) : undefined,
        source: f.source ? String(f.source) : undefined,
        addedAt: Number(f.addedAt) || 0,
      })) as GifFavorite[];
  } catch {
    return null;
  }
}

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
    if (loadedForAuth !== true) return;
    if (apiFavs === null) {
      setFavorites(readLocalFavorites());
    } else {
      setFavorites(apiFavs);
      const local = readLocalFavorites();
      const apiUrls = new Set(apiFavs.map((f) => f.url));
      const toSync = local.filter((f) => !apiUrls.has(f.url));
      if (toSync.length > 0) {
        Promise.all(
          toSync.map((f) =>
            fetch(`${API_BASE}/favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ url: f.url, title: f.title, source: f.source }),
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

function addFavoriteToStore(gif: { url: string; title?: string; source?: string }) {
  if (!gif.url) return;
  if (favorites.some((f) => f.url === gif.url)) return;
  setFavorites([{ ...gif, addedAt: Date.now() }, ...favorites]);
  if (currentIsAuthenticated) {
    fetch(`${API_BASE}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url: gif.url, title: gif.title, source: gif.source }),
    }).catch(() => {
      setFavorites(favorites.filter((f) => f.url !== gif.url));
    });
  } else {
    writeLocalFavorites(favorites);
  }
}

function removeFavoriteFromStore(url: string) {
  const removed = favorites.find((f) => f.url === url);
  setFavorites(favorites.filter((f) => f.url !== url));
  if (currentIsAuthenticated) {
    fetch(`${API_BASE}/favorites`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    }).catch(() => {
      if (removed && !favorites.some((f) => f.url === url)) {
        setFavorites([removed, ...favorites]);
      }
    });
  } else {
    writeLocalFavorites(favorites);
  }
}

export function useGifFavorites(): UseGifFavoritesReturn {
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
    (url: string) => favoritesState.some((f) => f.url === url),
    [favoritesState]
  );

  const addFavorite = useCallback(
    (gif: { url: string; title?: string; source?: string }) => addFavoriteToStore(gif),
    []
  );

  const removeFavorite = useCallback((url: string) => removeFavoriteFromStore(url), []);

  const toggleFavorite = useCallback(
    (gif: { url: string; title?: string; source?: string }) => {
      if (isFavorite(gif.url)) {
        removeFavorite(gif.url);
      } else {
        addFavorite(gif);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return useMemo(
    () => ({ favorites: favoritesState, isFavorite, addFavorite, removeFavorite, toggleFavorite, isReady: isReadyState }),
    [favoritesState, isFavorite, addFavorite, removeFavorite, toggleFavorite, isReadyState]
  );
}
