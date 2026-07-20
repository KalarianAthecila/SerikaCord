"use client";

export interface SavedAccountToken {
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  token: string;
  refreshToken?: string;
  savedAt: number;
}

export const SAVED_ACCOUNTS_COOKIE = "saved_accounts";

export function parseSavedAccountsCookie(): SavedAccountToken[] {
  if (typeof document === "undefined") return [];
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === SAVED_ACCOUNTS_COOKIE && value) {
        const decoded = decodeURIComponent(value);
        const parsed: SavedAccountToken[] = JSON.parse(decoded);
        // Deduplicate by email (case-insensitive), keeping the most recent
        const seen = new Map<string, SavedAccountToken>();
        for (const acct of parsed) {
          const key = acct.email.toLowerCase();
          const existing = seen.get(key);
          if (!existing || acct.savedAt > existing.savedAt) {
            seen.set(key, acct);
          }
        }
        return Array.from(seen.values());
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function setSavedAccountsCookie(accounts: SavedAccountToken[]) {
  if (typeof document === "undefined") return;
  try {
    const encoded = encodeURIComponent(JSON.stringify(accounts));
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${SAVED_ACCOUNTS_COOKIE}=${encoded}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function upsertSavedAccountToken(
  account: SavedAccountToken
) {
  const accounts = parseSavedAccountsCookie();
  const emailLower = account.email.toLowerCase();
  const index = accounts.findIndex((a) => a.email.toLowerCase() === emailLower);
  const newAccount = { ...account, savedAt: Date.now() };

  if (index >= 0) {
    accounts[index] = newAccount;
  } else {
    accounts.push(newAccount);
  }

  setSavedAccountsCookie(accounts);
}

export function removeSavedAccountToken(email: string) {
  const emailLower = email.toLowerCase();
  const accounts = parseSavedAccountsCookie().filter((a) => a.email.toLowerCase() !== emailLower);
  setSavedAccountsCookie(accounts);
}
