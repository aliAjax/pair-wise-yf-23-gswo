import type { ConsoleRole } from "../constants/ConsoleRole";

export interface ConsoleSnapshot {
  sceneName: string;
  positionMs: number;
  batch: number;
  updatedAt: string;
}

export interface HandoverRecord {
  at: string;
  message: string;
}

export interface HandoverData {
  primary: ConsoleSnapshot;
  backup: ConsoleSnapshot;
  activeRole: ConsoleRole;
  lockedRole: ConsoleRole | null;
  records: HandoverRecord[];
  lastError: string | null;
}
