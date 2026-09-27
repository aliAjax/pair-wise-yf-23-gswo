import type { ConsoleRole } from "../types/ConsoleRole";
import type { ConsoleState, HandoverLogEntry, HandoverState } from "../types/Handover";
import { HANDOVER_LOG_TEMPLATES } from "../constants/handoverLogTemplates";
import { ConsoleRoleText } from "../constants/ConsoleRole";

export const createDefaultConsoleState = (role: ConsoleRole, overrides: Partial<ConsoleState> = {}): ConsoleState => ({
  role,
  sceneId: 1,
  playMs: 0,
  batch: 0,
  locked: false,
  ...overrides
});

export const createHandoverLogEntry = (
  action: HandoverLogEntry["action"],
  message: string,
  overrides: Partial<HandoverLogEntry> = {}
): HandoverLogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  at: new Date().toISOString(),
  action,
  message,
  ...overrides
});

export const createDefaultHandoverState = (overrides: Partial<HandoverState> = {}): HandoverState => ({
  activeRole: "MAIN",
  consoles: {
    MAIN: createDefaultConsoleState("MAIN"),
    BACKUP: createDefaultConsoleState("BACKUP")
  },
  logs: [
    createHandoverLogEntry(
      "BOOT",
      HANDOVER_LOG_TEMPLATES.BOOT.replace("{role}", ConsoleRoleText.MAIN)
    )
  ],
  ...overrides
});
