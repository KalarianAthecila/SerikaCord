"use client";

export interface SavedAccount {
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  savedAt: number;
}

export const SAVED_ACCOUNTS_KEY = "serika:savedAccounts";

export function loadSavedAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: SavedAccount[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

export function upsertSavedAccount(
  user: { email: string; username: string; displayName?: string; avatar?: string } | null
) {
  if (!user?.email) return;

  const accounts = loadSavedAccounts();
  const index = accounts.findIndex((a) => a.email === user.email);
  const account: SavedAccount = {
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    savedAt: Date.now(),
  };

  if (index >= 0) {
    accounts[index] = { ...accounts[index], ...account };
  } else {
    accounts.push(account);
  }

  saveAccounts(accounts);
}
