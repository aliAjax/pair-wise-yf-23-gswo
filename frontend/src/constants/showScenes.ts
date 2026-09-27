export interface ShowScene {
  id: number;
  name: string;
}

export const SHOW_SCENES: ShowScene[] = [
  { id: 1, name: "开场" },
  { id: 2, name: "第一幕 · 城市夜色" },
  { id: 3, name: "第二幕 · 雨巷独舞" },
  { id: 4, name: "第三幕 · 群舞高潮" },
  { id: 5, name: "终幕 · 谢幕" }
];

export const findShowScene = (id: number): ShowScene =>
  SHOW_SCENES.find((scene) => scene.id === id) ?? SHOW_SCENES[0];
