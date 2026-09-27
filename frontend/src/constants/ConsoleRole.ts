export const ConsoleRole = ["MAIN", "BACKUP"] as const;
export type ConsoleRole = (typeof ConsoleRole)[number];
export const ConsoleRoleText: Record<ConsoleRole, string> = {
  MAIN: "主控台",
  BACKUP: "备控台"
};
