/**
 * Do Not Disturb, shared by the client (desktop/browser notifications, sounds,
 * toasts) and the server (phone pushes): either the user's status is "dnd" or
 * they turned on the DND switch in notification settings. Quiet-hours
 * schedules are checked on the client only, where the local time is known.
 */
export function isDoNotDisturb(status: string | null | undefined, dndSwitch: boolean): boolean {
  return status === "dnd" || dndSwitch;
}
