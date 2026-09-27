import type { ConsoleRole } from "../types/ConsoleRole";
import type { ConsoleState, HandoverLogEntry, HandoverState } from "../types/Handover";
import { ConsoleRoleText } from "../constants/ConsoleRole";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { HANDOVER_LOG_TEMPLATES } from "../constants/handoverLogTemplates";
import { findShowScene } from "../constants/showScenes";
import { createHandoverLogEntry } from "../constructors/HandoverConstructor";
import { formatPlayTime } from "../utils/formatters";

export const MAX_PLAY_MS = 3 * 60 * 60 * 1000;
const MAX_LOGS = 80;

export class HandoverError extends Error {
  code: string;
  logEntry?: HandoverLogEntry;

  constructor(code: string, message: string, logEntry?: HandoverLogEntry) {
    super(message);
    this.code = code;
    this.logEntry = logEntry;
  }
}

export const otherRole = (role: ConsoleRole): ConsoleRole => (role === "MAIN" ? "BACKUP" : "MAIN");

const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

const withLog = (state: HandoverState, entry: HandoverLogEntry): HandoverState => ({
  ...state,
  logs: [entry, ...state.logs].slice(0, MAX_LOGS)
});

const clampPlayMs = (playMs: number) => Math.min(Math.max(0, Math.round(playMs)), MAX_PLAY_MS);

/** 主控调整当前场景 / 播放时刻：批次 +1，备控随之落后。 */
export function adjustConsole(state: HandoverState, role: ConsoleRole, patch: { sceneId?: number; playMs?: number }): HandoverState {
  if (role !== state.activeRole) {
    throw new HandoverError(ERROR_CODES.HANDOVER_NOT_ACTIVE, ERROR_MESSAGES.HANDOVER_NOT_ACTIVE);
  }
  const current = state.consoles[role];
  if (current.locked) {
    throw new HandoverError(
      ERROR_CODES.HANDOVER_CONSOLE_LOCKED,
      fill(ERROR_MESSAGES.HANDOVER_CONSOLE_LOCKED, { role: ConsoleRoleText[role] })
    );
  }
  const next: ConsoleState = {
    ...current,
    sceneId: patch.sceneId ?? current.sceneId,
    playMs: clampPlayMs(patch.playMs ?? current.playMs),
    batch: current.batch + 1
  };
  const log = createHandoverLogEntry(
    "ADJUST",
    fill(HANDOVER_LOG_TEMPLATES.ADJUST, {
      role: ConsoleRoleText[role],
      scene: findShowScene(next.sceneId).name,
      time: formatPlayTime(next.playMs),
      batch: next.batch
    })
  );
  return withLog({ ...state, consoles: { ...state.consoles, [role]: next } }, log);
}

/** 同步备控：备控取齐主控的场景 / 时刻 / 批次，并解除备控锁定。 */
export function syncStandby(state: HandoverState, fromRole: ConsoleRole): HandoverState {
  if (fromRole !== state.activeRole) {
    throw new HandoverError(ERROR_CODES.HANDOVER_NOT_ACTIVE, ERROR_MESSAGES.HANDOVER_NOT_ACTIVE);
  }
  const from = state.consoles[fromRole];
  if (from.locked) {
    throw new HandoverError(
      ERROR_CODES.HANDOVER_CONSOLE_LOCKED,
      fill(ERROR_MESSAGES.HANDOVER_CONSOLE_LOCKED, { role: ConsoleRoleText[fromRole] })
    );
  }
  const toRole = otherRole(fromRole);
  const synced: ConsoleState = { ...state.consoles[toRole], sceneId: from.sceneId, playMs: from.playMs, batch: from.batch, locked: false };
  const log = createHandoverLogEntry(
    "SYNC",
    fill(HANDOVER_LOG_TEMPLATES.SYNC, {
      from: ConsoleRoleText[fromRole],
      to: ConsoleRoleText[toRole],
      batch: from.batch
    })
  );
  return withLog({ ...state, consoles: { ...state.consoles, [toRole]: synced } }, log);
}

/** 备控请求接管：批次不一致则拒绝并指出落后方；成功后原主控锁定。 */
export function requestTakeover(state: HandoverState, byRole: ConsoleRole): HandoverState {
  if (byRole === state.activeRole) {
    throw new HandoverError(ERROR_CODES.HANDOVER_NOT_STANDBY, ERROR_MESSAGES.HANDOVER_NOT_STANDBY);
  }
  const main = state.consoles.MAIN;
  const backup = state.consoles.BACKUP;
  if (main.batch !== backup.batch) {
    const lagger: ConsoleRole = main.batch < backup.batch ? "MAIN" : "BACKUP";
    const gap = Math.abs(main.batch - backup.batch);
    const vars = {
      lagger: ConsoleRoleText[lagger],
      gap,
      mainBatch: main.batch,
      backupBatch: backup.batch
    };
    const log = createHandoverLogEntry("TAKEOVER_REJECTED", fill(HANDOVER_LOG_TEMPLATES.TAKEOVER_REJECTED, vars));
    throw new HandoverError(ERROR_CODES.HANDOVER_BATCH_MISMATCH, fill(ERROR_MESSAGES.HANDOVER_BATCH_MISMATCH, vars), log);
  }
  const activeRole = byRole;
  const demotedRole = otherRole(byRole);
  const log = createHandoverLogEntry(
    "TAKEOVER",
    fill(HANDOVER_LOG_TEMPLATES.TAKEOVER, {
      from: ConsoleRoleText[byRole],
      to: ConsoleRoleText[demotedRole]
    })
  );
  const next: HandoverState = {
    ...state,
    activeRole,
    consoles: {
      ...state.consoles,
      [demotedRole]: { ...state.consoles[demotedRole], locked: true }
    }
  };
  return withLog(next, log);
}
