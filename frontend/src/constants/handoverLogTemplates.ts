export const HANDOVER_LOG_TEMPLATES = {
  BOOT: "交接台初始化，{role} 持有控制权",
  ADJUST: "{role} 调整演出状态 → 场景「{scene}」/ 播放时刻 {time}，同步批次升至 #{batch}",
  SYNC: "{from} 向 {to} 同步备控，两侧状态取齐（批次 #{batch}），{to} 解除锁定",
  TAKEOVER: "{from} 批次一致，接管成功，{to} 暂时失去控制，等待再次同步",
  TAKEOVER_REJECTED: "接管被拒绝：{lagger} 落后 {gap} 个批次（主控台 #{mainBatch} / 备控台 #{backupBatch}）",
  RESET: "交接台演示数据已重置"
};

export const HANDOVER_ACTION_TEXT: Record<string, string> = {
  BOOT: "初始化",
  ADJUST: "调整",
  SYNC: "同步",
  TAKEOVER: "接管",
  TAKEOVER_REJECTED: "拒绝",
  RESET: "重置"
};

