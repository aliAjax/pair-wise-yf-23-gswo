import { create } from "zustand";
import type { ConsoleRole } from "../types/ConsoleRole";
import type { HandoverState } from "../types/Handover";
import { loadHandoverState, resetHandoverState, saveHandoverState } from "../api/Handover";
import { createDefaultHandoverState, createHandoverLogEntry } from "../constructors/HandoverConstructor";
import { HANDOVER_LOG_TEMPLATES } from "../constants/handoverLogTemplates";
import { HandoverError, adjustConsole, requestTakeover, syncStandby } from "../services/handoverService";

type Notice = { kind: "ok" | "error"; text: string } | null;

type State = {
  state: HandoverState;
  loading: boolean;
  notice: Notice;
  load: () => Promise<void>;
  applyExternal: (state: HandoverState) => void;
  adjust: (role: ConsoleRole, patch: { sceneId?: number; playMs?: number }) => Promise<void>;
  sync: (role: ConsoleRole) => Promise<void>;
  takeover: (role: ConsoleRole) => Promise<void>;
  reset: () => Promise<void>;
  dismissNotice: () => void;
};

export const useHandoverStore = create<State>((set, get) => {
  /** controller 层：包装 service 抛出的领域异常，统一落到 notice。 */
  const run = async (fn: () => HandoverState | Promise<HandoverState>, okText: string) => {
    try {
      const next = await fn();
      await saveHandoverState(next);
      set({ state: next, notice: { kind: "ok", text: okText } });
    } catch (error) {
      if (error instanceof HandoverError) {
        const current = get().state;
        const next = error.logEntry ? { ...current, logs: [error.logEntry, ...current.logs] } : current;
        await saveHandoverState(next);
        set({ state: next, notice: { kind: "error", text: error.message } });
      } else {
        set({ notice: { kind: "error", text: "交接台操作失败，请重试" } });
      }
    }
  };

  return {
    state: createDefaultHandoverState(),
    loading: false,
    notice: null,
    async load() {
      set({ loading: true });
      set({ state: await loadHandoverState(), loading: false });
    },
    applyExternal(state) {
      set({ state });
    },
    async adjust(role, patch) {
      await run(() => adjustConsole(get().state, role, patch), "已调整演出状态，备控待同步");
    },
    async sync(role) {
      await run(() => syncStandby(get().state, role), "同步备控完成，两侧状态已取齐");
    },
    async takeover(role) {
      await run(() => requestTakeover(get().state, role), "接管成功，原主控已暂时失去控制");
    },
    async reset() {
      const fresh = await resetHandoverState();
      const log = createHandoverLogEntry("RESET", HANDOVER_LOG_TEMPLATES.RESET);
      const next = { ...fresh, logs: [log, ...fresh.logs] };
      await saveHandoverState(next);
      set({ state: next, notice: { kind: "ok", text: HANDOVER_LOG_TEMPLATES.RESET } });
    },
    dismissNotice() {
      set({ notice: null });
    }
  };
});
