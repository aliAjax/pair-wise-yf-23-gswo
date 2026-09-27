import type { ConsoleRole } from "./ConsoleRole";

export interface ConsoleState {
  role: ConsoleRole;
  sceneId: number;
  playMs: number;
  batch: number;
  locked: boolean;
}

export type HandoverAction = "BOOT" | "ADJUST" | "SYNC" | "TAKEOVER" | "TAKEOVER_REJECTED" | "RESET";

export interface HandoverLogEntry {
  id: string;
  at: string;
  action: HandoverAction;
  message: string;
}

export interface HandoverState {
  activeRole: ConsoleRole;
  consoles: Record<ConsoleRole, ConsoleState>;
  logs: HandoverLogEntry[];
}
