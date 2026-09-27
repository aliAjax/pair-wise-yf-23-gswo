export const HandoverStatus = ["IN_SYNC", "LAGGING", "LOCKED_OUT"] as const;
export type HandoverStatus = (typeof HandoverStatus)[number];
export const HandoverStatusText: Record<HandoverStatus, string> = {
  IN_SYNC: "已同步",
  LAGGING: "落后",
  LOCKED_OUT: "已锁定"
};
