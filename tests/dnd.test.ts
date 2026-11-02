import { describe, expect, test } from "bun:test";
import { isDoNotDisturb } from "@/lib/notifications/dnd";

describe("Do Not Disturb", () => {
  test("the dnd status silences notifications", () => {
    expect(isDoNotDisturb("dnd", false)).toBe(true);
  });
  test("the DND switch in notification settings silences notifications", () => {
    expect(isDoNotDisturb("online", true)).toBe(true);
  });
  test("other statuses with the switch off still notify", () => {
    for (const s of ["online", "idle", "offline", "invisible", null, undefined]) {
      expect(isDoNotDisturb(s, false)).toBe(false);
    }
  });
});
