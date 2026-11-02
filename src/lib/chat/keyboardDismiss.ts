/**
 * Scroll-to-dismiss for the on-screen keyboard (CORD-91): dragging the
 * message list toward older messages while the composer has focus hides the
 * keyboard, like Discord, iMessage and WhatsApp.
 *
 * Only a deliberate vertical finger drag counts. Taps, horizontal swipes
 * (swipe-to-reply, the phone shell's panel pager), pinches, text selection
 * and anything programmatic (loading older history, auto-scroll to new
 * messages, jump-to-message) never do, since those don't come with a touch.
 *
 * Pure; MessageList feeds it touch samples. Covered by tests/keyboard-dismiss.test.ts.
 */

/** Finger travel (px, downward = toward older messages) before the keyboard hides. */
export const KEYBOARD_DISMISS_DRAG_PX = 24;
/** Movement before a gesture's axis is decided. */
const AXIS_SLOP_PX = 10;
/** The list moving the other way (toward newer) by more than this cancels. */
const OPPOSITE_SCROLL_PX = 4;

export interface KeyboardDismissGesture {
  /** Decided axis: "x" for horizontal swipes (never dismisses), "y" for scrolls. */
  axis: "x" | "y" | null;
  /** The gesture already dismissed, or was ruled out. */
  done: boolean;
}

export interface KeyboardDismissSample {
  /** Finger offset from where the touch started (px). dy > 0 = finger moved down = list scrolls toward older messages. */
  dx: number;
  dy: number;
  /** How far the list moved toward older messages since the touch started (startScrollTop - scrollTop). */
  scrolledTowardOlder: number;
  /** More than one finger is down (pinch). */
  multiTouch: boolean;
  /** The chat composer has focus (so the keyboard is up). */
  composerFocused: boolean;
  /** The user is selecting text. */
  selectingText: boolean;
}

export function startKeyboardDismissGesture(): KeyboardDismissGesture {
  return { axis: null, done: false };
}

/** Feeds one touchmove; returns the next gesture state and whether to blur the composer now. */
export function stepKeyboardDismissGesture(
  gesture: KeyboardDismissGesture,
  s: KeyboardDismissSample,
): { gesture: KeyboardDismissGesture; dismiss: boolean } {
  if (gesture.done) return { gesture, dismiss: false };
  if (s.multiTouch || s.selectingText) return { gesture: { ...gesture, done: true }, dismiss: false };

  let axis = gesture.axis;
  if (axis === null) {
    const ax = Math.abs(s.dx);
    const ay = Math.abs(s.dy);
    if (Math.max(ax, ay) < AXIS_SLOP_PX) return { gesture, dismiss: false };
    axis = ax > ay ? "x" : "y";
    if (axis === "x") return { gesture: { axis, done: true }, dismiss: false };
  }

  // Dragging toward newer messages (finger up) or the list moving that way: not this gesture.
  if (s.dy <= -AXIS_SLOP_PX || s.scrolledTowardOlder < -OPPOSITE_SCROLL_PX) {
    return { gesture: { axis, done: true }, dismiss: false };
  }
  if (!s.composerFocused) return { gesture: { axis, done: false }, dismiss: false };
  // Mostly vertical, and far enough.
  if (s.dy >= KEYBOARD_DISMISS_DRAG_PX && Math.abs(s.dx) <= s.dy * 0.6) {
    return { gesture: { axis, done: true }, dismiss: true };
  }
  return { gesture: { axis, done: false }, dismiss: false };
}
