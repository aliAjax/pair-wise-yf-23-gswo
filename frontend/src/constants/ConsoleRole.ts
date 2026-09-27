export const ConsoleRole = ["PRIMARY", "BACKUP"] as const;
export type ConsoleRole = (typeof ConsoleRole)[number];
export const ConsoleRoleText: Record<ConsoleRole, string> = {
  PRIMARY: "主控",
  BACKUP: "备控"
};
