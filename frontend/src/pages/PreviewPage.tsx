import { ConsolePanel } from "../components/common/ConsolePanel";
import { HandoverLogList } from "../components/common/HandoverLogList";
import { StatusBadge } from "../components/common/StatusBadge";
import { ConsoleRoleText } from "../constants/ConsoleRole";
import { useHandoverStation } from "../hooks/useHandoverStation";

export function PreviewPage() {
  const { state, view, notice, adjust, sync, takeover, reset, dismissNotice } = useHandoverStation();

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light / preview</p>
          <h1>主备控交接台</h1>
        </div>
        <StatusBadge value={view.aligned ? "两侧已取齐" : "备控落后"} />
      </section>

      {notice && (
        <div className={`notice ${notice.kind}`} role="status">
          <span>{notice.text}</span>
          <button type="button" className="handover-btn" onClick={dismissNotice}>知道了</button>
        </div>
      )}

      <section className="console-grid">
        {(["MAIN", "BACKUP"] as const).map((role) => (
          <ConsolePanel
            key={role}
            consoleState={state.consoles[role]}
            isActive={view.activeRole === role}
            lagging={view.standbyRole === role && view.batchGap > 0}
            batchGap={view.batchGap}
            onAdjustScene={(sceneId) => void adjust(role, { sceneId })}
            onAdjustTime={(deltaMs) => void adjust(role, { playMs: state.consoles[role].playMs + deltaMs })}
            onSync={() => void sync(role)}
            onTakeover={() => void takeover(role)}
          />
        ))}
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>交接记录</h2>
          <HandoverLogList logs={state.logs} />
        </div>
        <div className="panel">
          <h2>交接规则</h2>
          <ul className="rule-list">
            <li>主控调整场景或播放时刻后，同步批次 +1，备控标记落后。</li>
            <li>主控点击「同步备控」，两侧场景、时刻、批次取齐。</li>
            <li>批次不一致时拒绝接管，并指出哪台控台落后。</li>
            <li>接管成功后原主控锁定，再次同步前无法操作。</li>
            <li>当前主控：{ConsoleRoleText[view.activeRole]}（批次 #{view.active.batch}）。</li>
          </ul>
          <button type="button" className="handover-btn" onClick={() => void reset()}>重置演示</button>
        </div>
      </section>
    </main>
  );
}
