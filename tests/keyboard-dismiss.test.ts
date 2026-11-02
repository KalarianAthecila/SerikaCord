import { describe, expect, test } from "bun:test";
import {
  KEYBOARD_DISMISS_DRAG_PX,
  startKeyboardDismissGesture,
  stepKeyboardDismissGesture,
  type KeyboardDismissSample,
} from "../src/lib/chat/keyboardDismiss";

const base: KeyboardDismissSample = { dx: 0, dy: 0, scrolledTowardOlder: 0, multiTouch: false, composerFocused: true, selectingText: false };

/** Runs a touch path; returns whether (and at which step) the composer would blur. */
function run(path: Array<Partial<KeyboardDismissSample>>): number {
  let g = startKeyboardDismissGesture();
  for (let i = 0; i < path.length; i++) {
    const r = stepKeyboardDismissGesture(g, { ...base, ...path[i] });
    g = r.gesture;
    if (r.dismiss) return i;
  }
  return -1;
}

describe("keyboard scroll-to-dismiss (CORD-91)", () => {
  test("a deliberate drag toward older messages dismisses once, past the threshold", () => {
    const path = [6, 12, 20, 26, 40, 60].map((dy) => ({ dy, scrolledTowardOlder: dy }));
    expect(run(path)).toBe(3);
    expect(KEYBOARD_DISMISS_DRAG_PX).toBe(24);
  });

  test("dismisses only once per gesture", () => {
    let g = startKeyboardDismissGesture();
    let count = 0;
    for (const dy of [12, 30, 50, 80]) {
      const r = stepKeyboardDismissGesture(g, { ...base, dy, scrolledTowardOlder: dy });
      g = r.gesture;
      if (r.dismiss) count++;
    }
    expect(count).toBe(1);
  });

  test("a tap or small jiggle never dismisses", () => {
    expect(run([{ dy: 2 }, { dy: 5, dx: 3 }, { dy: 8 }])).toBe(-1);
    expect(run([{ dy: 20, scrolledTowardOlder: 20 }])).toBe(-1);
  });

  test("scrolling toward newer messages never dismisses", () => {
    expect(run([{ dy: -12 }, { dy: -40, scrolledTowardOlder: -40 }])).toBe(-1);
    // Finger goes up first, then back down past the threshold: still the same (upward) gesture.
    expect(run([{ dy: -15 }, { dy: 30, scrolledTowardOlder: 0 }])).toBe(-1);
  });

  test("horizontal swipes (swipe-to-reply, panel pager) never dismiss", () => {
    expect(run([{ dx: 14, dy: 3 }, { dx: 40, dy: 30 }, { dx: 60, dy: 50, scrolledTowardOlder: 50 }])).toBe(-1);
    // Vertical-ish but too diagonal.
    expect(run([{ dx: 6, dy: 12 }, { dx: 25, dy: 30, scrolledTowardOlder: 30 }])).toBe(-1);
  });

  test("pinch and text selection rule the gesture out", () => {
    expect(run([{ dy: 12, multiTouch: true }, { dy: 40, scrolledTowardOlder: 40 }])).toBe(-1);
    expect(run([{ dy: 12, selectingText: true }, { dy: 40, scrolledTowardOlder: 40 }])).toBe(-1);
  });

  test("no focused composer, no dismiss; focusing mid-drag still works", () => {
    expect(run([{ dy: 12, composerFocused: false }, { dy: 40, composerFocused: false, scrolledTowardOlder: 40 }])).toBe(-1);
    expect(run([{ dy: 12, composerFocused: false }, { dy: 40, scrolledTowardOlder: 40 }])).toBe(1);
  });

  test("the list moving the other way (momentum toward newer) cancels", () => {
    expect(run([{ dy: 12, scrolledTowardOlder: -10 }, { dy: 40, scrolledTowardOlder: 20 }])).toBe(-1);
  });

  test("a short list that cannot scroll still dismisses on the drag", () => {
    expect(run([{ dy: 12 }, { dy: 30 }])).toBe(1);
  });
});
