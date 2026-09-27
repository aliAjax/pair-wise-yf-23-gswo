export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  HANDOVER_CONSOLE_LOCKED: "{role} 已暂时失去控制，请先执行同步备控恢复操作",
  HANDOVER_NOT_ACTIVE: "只有当前主控可以调整演出状态",
  HANDOVER_NOT_STANDBY: "只有备控台可以发起接管",
  HANDOVER_BATCH_MISMATCH: "接管被拒绝：{lagger} 落后 {gap} 个批次（主控台 #{mainBatch} / 备控台 #{backupBatch}）"
};
