/**
 * App-wide keyboard shortcut registry (Discord-parity hotkeys).
 *
 * Two kinds of shortcut:
 *  - "navigation" actions are handled directly inside `useAppHotkeys`
 *    (they need the router + server/channel/unread context).
 *  - "action" shortcuts are broadcast on a tiny event bus so whichever
 *    component owns the relevant UI (chat area, composer, voice bar, layout)
 *    can react without prop-drilling.
 *
 * The same list feeds the Ctrl+/ shortcuts help overlay so the docs never
 * drift from the actual bindings.
 */

export type HotkeyAction =
  // Navigation (handled in useAppHotkeys)
  | "nav-server-prev"
  | "nav-server-next"
  | "nav-channel-prev"
  | "nav-channel-next"
  | "nav-unread-prev"
  | "nav-unread-next"
  | "nav-mention-prev"
  | "nav-mention-next"
  | "nav-prev-channel"
  | "mark-channel-read"
  | "mark-server-read"
  | "goto-dm"
  // Broadcast actions (handled by owning components)
  | "toggle-help"
  | "toggle-pins"
  | "toggle-mentions"
  | "toggle-members"
  | "toggle-emoji"
  | "focus-composer"
  | "scroll-up"
  | "scroll-down"
  | "jump-oldest-unread"
  | "create-server"
  | "upload-file"
  | "toggle-mute"
  | "toggle-deafen"
  | "open-help-center";

export interface Hotkey {
  action: HotkeyAction;
  /** lowercased KeyboardEvent.key, or a code-independent single char */
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Whether this fires even while a text field / composer is focused. */
  worksWhileTyping?: boolean;
  /** Human label for the help overlay. */
  label: string;
  category: "Navigation" | "Chat" | "Voice" | "Application";
}

/**
 * The full binding table. `key` matches `KeyboardEvent.key` (lowercased).
 * `ctrl` matches ctrlKey OR metaKey so macOS ⌘ and Windows Ctrl both work.
 */
export const HOTKEYS: Hotkey[] = [
  // ---- Navigation ----
  { action: "nav-server-prev", key: "arrowup", ctrl: true, alt: true, worksWhileTyping: true, label: "Navigate to previous server", category: "Navigation" },
  { action: "nav-server-next", key: "arrowdown", ctrl: true, alt: true, worksWhileTyping: true, label: "Navigate to next server", category: "Navigation" },
  { action: "nav-mention-prev", key: "arrowup", ctrl: true, shift: true, alt: true, worksWhileTyping: true, label: "Previous unread channel with mentions", category: "Navigation" },
  { action: "nav-mention-next", key: "arrowdown", ctrl: true, shift: true, alt: true, worksWhileTyping: true, label: "Next unread channel with mentions", category: "Navigation" },
  { action: "nav-unread-prev", key: "arrowup", shift: true, alt: true, worksWhileTyping: true, label: "Previous unread channel", category: "Navigation" },
  { action: "nav-unread-next", key: "arrowdown", shift: true, alt: true, worksWhileTyping: true, label: "Next unread channel", category: "Navigation" },
  { action: "nav-channel-prev", key: "arrowup", alt: true, worksWhileTyping: true, label: "Navigate to previous channel", category: "Navigation" },
  { action: "nav-channel-next", key: "arrowdown", alt: true, worksWhileTyping: true, label: "Navigate to next channel", category: "Navigation" },
  { action: "nav-prev-channel", key: "b", ctrl: true, worksWhileTyping: true, label: "Return to previous text channel", category: "Navigation" },
  { action: "goto-dm", key: "k", ctrl: true, worksWhileTyping: true, label: "Find or start a direct message", category: "Navigation" },
  { action: "mark-server-read", key: "escape", shift: true, worksWhileTyping: true, label: "Mark server as read", category: "Navigation" },
  { action: "mark-channel-read", key: "escape", worksWhileTyping: false, label: "Mark channel as read", category: "Navigation" },

  // ---- Chat ----
  { action: "toggle-pins", key: "p", ctrl: true, worksWhileTyping: true, label: "Toggle pinned messages", category: "Chat" },
  { action: "toggle-mentions", key: "i", ctrl: true, worksWhileTyping: true, label: "Toggle mentions popout", category: "Chat" },
  { action: "toggle-members", key: "u", ctrl: true, worksWhileTyping: true, label: "Toggle member list", category: "Chat" },
  { action: "toggle-emoji", key: "e", ctrl: true, worksWhileTyping: true, label: "Toggle emoji picker", category: "Chat" },
  { action: "upload-file", key: "u", ctrl: true, shift: true, worksWhileTyping: true, label: "Upload a file", category: "Chat" },
  { action: "focus-composer", key: "tab", worksWhileTyping: false, label: "Focus the text area", category: "Chat" },
  { action: "jump-oldest-unread", key: "pageup", shift: true, worksWhileTyping: true, label: "Jump to oldest unread message", category: "Chat" },
  { action: "scroll-up", key: "pageup", worksWhileTyping: true, label: "Scroll chat up", category: "Chat" },
  { action: "scroll-down", key: "pagedown", worksWhileTyping: true, label: "Scroll chat down", category: "Chat" },

  // ---- Voice ----
  { action: "toggle-mute", key: "m", ctrl: true, shift: true, worksWhileTyping: true, label: "Toggle mute", category: "Voice" },
  { action: "toggle-deafen", key: "d", ctrl: true, shift: true, worksWhileTyping: true, label: "Toggle deafen", category: "Voice" },

  // ---- Application ----
  { action: "create-server", key: "n", ctrl: true, shift: true, worksWhileTyping: true, label: "Create or join a server", category: "Application" },
  { action: "toggle-help", key: "/", ctrl: true, worksWhileTyping: true, label: "Toggle keyboard shortcuts", category: "Application" },
  { action: "open-help-center", key: "h", ctrl: true, shift: true, worksWhileTyping: true, label: "Open help center", category: "Application" },
];

/** Match a keyboard event against the binding table (most-specific first). */
export function matchHotkey(e: KeyboardEvent): Hotkey | null {
  const key = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  // Sort so bindings with more modifiers win (e.g. Ctrl+Alt+↑ before Alt+↑).
  for (const hk of [...HOTKEYS].sort((a, b) => modifierCount(b) - modifierCount(a))) {
    if (hk.key !== key) continue;
    if (!!hk.ctrl !== ctrl) continue;
    if (!!hk.shift !== e.shiftKey) continue;
    if (!!hk.alt !== e.altKey) continue;
    return hk;
  }
  return null;
}

function modifierCount(hk: Hotkey): number {
  return (hk.ctrl ? 1 : 0) + (hk.shift ? 1 : 0) + (hk.alt ? 1 : 0);
}

/** Pretty key-combo string for the help overlay, platform-aware. */
export function formatHotkey(hk: Hotkey): string {
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const parts: string[] = [];
  if (hk.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
  if (hk.shift) parts.push("Shift");
  if (hk.alt) parts.push(isMac ? "⌥" : "Alt");
  parts.push(prettyKey(hk.key));
  return parts.join(" + ");
}

function prettyKey(key: string): string {
  const map: Record<string, string> = {
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    pageup: "Page Up",
    pagedown: "Page Down",
    escape: "Esc",
    tab: "Tab",
    "/": "/",
  };
  return map[key] ?? key.toUpperCase();
}

// ---------------------------------------------------------------------------
// Tiny synchronous event bus for broadcast ("action") hotkeys.
// ---------------------------------------------------------------------------

const HOTKEY_EVENT = "serika:hotkey";

/** Fire a broadcast hotkey action. */
export function emitHotkey(action: HotkeyAction): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<HotkeyAction>(HOTKEY_EVENT, { detail: action }));
}

/** Subscribe to a specific broadcast hotkey action. Returns an unsubscribe fn. */
export function onHotkey(action: HotkeyAction, handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    if ((e as CustomEvent<HotkeyAction>).detail === action) handler();
  };
  window.addEventListener(HOTKEY_EVENT, listener);
  return () => window.removeEventListener(HOTKEY_EVENT, listener);
}
