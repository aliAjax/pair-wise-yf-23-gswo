import { useEffect, useMemo } from "react";
import type { ConsoleRole } from "../types/ConsoleRole";
import type { HandoverState } from "../types/Handover";
import { HANDOVER_STORAGE_KEY } from "../api/Handover";
import { useHandoverStore } from "../stores/HandoverStore";

/** 交接台装配：加载持久化状态、跨标签页同步、派生主备显示数据。 */
export function useHandoverStation() {
  const { state, loading, notice, load, applyExternal, adjust, sync, takeover, reset, dismissNotice } = useHandoverStore();

  useEffect(() => {
    void load();
  }, [load]);

  // 另一个标签页写入 localStorage 时，本页实时跟进（模拟主备两台电脑）。
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== HANDOVER_STORAGE_KEY || !event.newValue) return;
      try {
        applyExternal(JSON.parse(event.newValue) as HandoverState);
      } catch {
        // 非法快照直接忽略，等待下一次同步。
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyExternal]);

  const view = useMemo(() => {
    const activeRole = state.activeRole;
    const standbyRole: ConsoleRole = activeRole === "MAIN" ? "BACKUP" : "MAIN";
    const active = state.consoles[activeRole];
    const standby = state.consoles[standbyRole];
    const batchGap = active.batch - standby.batch;
    const aligned = batchGap === 0 && active.sceneId === standby.sceneId && active.playMs === standby.playMs;
    return { activeRole, standbyRole, active, standby, batchGap, aligned };
  }, [state]);

  return { state, view, loading, notice, adjust, sync, takeover, reset, dismissNotice };
}
