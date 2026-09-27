import { create } from "zustand";
import type { ConsoleRole } from "../constants/ConsoleRole";
import { ConsoleRoleText } from "../constants/ConsoleRole";
import type { HandoverData, HandoverRecord } from "../types/Handover";
import { createDefaultHandoverData } from "../constructors/HandoverConstructor";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const STORAGE_KEY = "stage-light-handover";

type State = HandoverData & {
  adjustScene: (role: ConsoleRole, sceneName: string) => void;
  adjustPosition: (role: ConsoleRole, deltaMs: number) => void;
  syncBackup: () => void;
  takeover: (role: ConsoleRole) => void;
};

function loadPersisted(): HandoverData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...createDefaultHandoverData(), ...JSON.parse(raw) };
  } catch {
    // Corrupted cache falls back to the default handover data.
  }
  return createDefaultHandoverData();
}

function persist(data: HandoverData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Persistence is best-effort; the console keeps working in memory.
  }
}

const stamp = (message: string): HandoverRecord => ({ at: new Date().toISOString(), message });

const dataOf = (s: HandoverData): HandoverData => ({
  primary: s.primary,
  backup: s.backup,
  activeRole: s.activeRole,
  lockedRole: s.lockedRole,
  records: s.records,
  lastError: s.lastError
});

export const useHandoverStore = create<State>((set, get) => {
  const commit = (next: Partial<HandoverData>) => {
    set(next);
    persist(dataOf(get()));
  };

  const adjust = (role: ConsoleRole, patch: { sceneName?: string; deltaMs?: number }) => {
    const s = get();
    if (s.lockedRole === role) {
      commit({ lastError: `${ERROR_MESSAGES.CONSOLE_LOCKED}（${ConsoleRoleText[role]}）` });
      return;
    }
    if (s.activeRole !== role) return;
    const current = s[role === "PRIMARY" ? "primary" : "backup"];
    const next = {
      ...current,
      sceneName: patch.sceneName ?? current.sceneName,
      positionMs: Math.max(0, current.positionMs + (patch.deltaMs ?? 0)),
      batch: current.batch + 1,
      updatedAt: new Date().toISOString()
    };
    commit({
      [role === "PRIMARY" ? "primary" : "backup"]: next,
      lastError: null,
      records: [...s.records, stamp(`${LOG_TEMPLATES.Handover[0]}：${ConsoleRoleText[role]} → ${next.sceneName}`)]
    } as Partial<HandoverData>);
  };

  return {
    ...loadPersisted(),
    adjustScene: (role, sceneName) => adjust(role, { sceneName }),
    adjustPosition: (role, deltaMs) => adjust(role, { deltaMs }),
    syncBackup() {
      const s = get();
      const sourceKey = s.activeRole === "PRIMARY" ? "primary" : "backup";
      const targetKey = s.activeRole === "PRIMARY" ? "backup" : "primary";
      const standbyRole: ConsoleRole = s.activeRole === "PRIMARY" ? "BACKUP" : "PRIMARY";
      commit({
        [targetKey]: { ...s[sourceKey] },
        lockedRole: null,
        lastError: null,
        records: [...s.records, stamp(`${LOG_TEMPLATES.Handover[1]}：${ConsoleRoleText[s.activeRole]} → ${ConsoleRoleText[standbyRole]}，批次 ${s[sourceKey].batch}`)]
      } as Partial<HandoverData>);
    },
    takeover(role) {
      const s = get();
      if (role === s.activeRole) return;
      if (s.lockedRole === role) {
        commit({ lastError: `${ERROR_MESSAGES.CONSOLE_LOCKED}（${ConsoleRoleText[role]}）` });
        return;
      }
      if (s.primary.batch !== s.backup.batch) {
        const lagging: ConsoleRole = s.primary.batch < s.backup.batch ? "PRIMARY" : "BACKUP";
        const gap = Math.abs(s.primary.batch - s.backup.batch);
        commit({
          lastError: `${ERROR_MESSAGES.BATCH_MISMATCH}：${ConsoleRoleText[lagging]}落后 ${gap} 个批次`,
          records: [...s.records, stamp(`${LOG_TEMPLATES.Handover[3]}：${ConsoleRoleText[lagging]}落后 ${gap} 个批次`)]
        });
        return;
      }
      commit({
        activeRole: role,
        lockedRole: s.activeRole,
        lastError: null,
        records: [
          ...s.records,
          stamp(`${LOG_TEMPLATES.Handover[2]}：${ConsoleRoleText[role]}取得控制`),
          stamp(`${LOG_TEMPLATES.Handover[4]}：${ConsoleRoleText[s.activeRole]}等待再次同步`)
        ]
      });
    }
  };
});
