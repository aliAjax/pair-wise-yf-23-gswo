import { useHandoverStore } from "../stores/HandoverStore";
import type { ConsoleRole } from "../constants/ConsoleRole";
import type { HandoverStatus } from "../constants/HandoverStatus";

export function useHandoverSync() {
  const primary = useHandoverStore((s) => s.primary);
  const backup = useHandoverStore((s) => s.backup);
  const activeRole = useHandoverStore((s) => s.activeRole);
  const lockedRole = useHandoverStore((s) => s.lockedRole);

  const inSync = primary.batch === backup.batch;
  const laggingRole: ConsoleRole | null = inSync ? null : primary.batch < backup.batch ? "PRIMARY" : "BACKUP";
  const batchGap = Math.abs(primary.batch - backup.batch);

  const consoleStatus = (role: ConsoleRole): HandoverStatus => {
    if (lockedRole === role) return "LOCKED_OUT";
    if (laggingRole === role) return "LAGGING";
    return "IN_SYNC";
  };

  return { inSync, laggingRole, batchGap, consoleStatus, activeRole, lockedRole };
}
