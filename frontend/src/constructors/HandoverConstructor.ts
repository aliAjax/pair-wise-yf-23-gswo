import type { ConsoleSnapshot, HandoverData } from "../types/Handover";
import { mockData } from "../mocks/seedData";

export const createDefaultConsoleSnapshot = (overrides: Partial<ConsoleSnapshot> = {}): ConsoleSnapshot => ({
  sceneName: mockData.cueScene[0]?.name ?? "开场",
  positionMs: 0,
  batch: 1,
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createDefaultHandoverData = (): HandoverData => ({
  primary: createDefaultConsoleSnapshot(),
  backup: createDefaultConsoleSnapshot(),
  activeRole: "PRIMARY",
  lockedRole: null,
  records: [],
  lastError: null
});
