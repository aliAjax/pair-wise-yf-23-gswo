import type { HandoverState } from "../types/Handover";
import { createDefaultHandoverState } from "../constructors/HandoverConstructor";

export const HANDOVER_STORAGE_KEY = "stage-light.handover-state.v1";

export async function loadHandoverState(): Promise<HandoverState> {
  try {
    const raw = window.localStorage.getItem(HANDOVER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HandoverState;
      if (parsed && parsed.consoles?.MAIN && parsed.consoles?.BACKUP) {
        return { ...createDefaultHandoverState({ logs: [] }), ...parsed };
      }
    }
  } catch {
    // 本地存储不可用时回落到默认交接状态，保证页面可用。
  }
  return createDefaultHandoverState();
}

export async function saveHandoverState(state: HandoverState): Promise<HandoverState> {
  try {
    window.localStorage.setItem(HANDOVER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储失败时仅保留内存态，不阻断演出操作。
  }
  return state;
}

export async function resetHandoverState(): Promise<HandoverState> {
  try {
    window.localStorage.removeItem(HANDOVER_STORAGE_KEY);
  } catch {
    // 忽略清理失败，重置结果以内存态为准。
  }
  return createDefaultHandoverState();
}
