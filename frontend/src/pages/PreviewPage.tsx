import { useMemo } from "react";
import { mockData } from "../mocks/seedData";
import { useHandoverStore } from "../stores/HandoverStore";
import { useHandoverSync } from "../hooks/useHandoverSync";
import { ConsolePanel } from "../components/common/ConsolePanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { ConsoleRoleText } from "../constants/ConsoleRole";
import { formatDate } from "../utils/formatters";

export function PreviewPage() {
  const primary = useHandoverStore((s) => s.primary);
  const backup = useHandoverStore((s) => s.backup);
  const records = useHandoverStore((s) => s.records);
  const lastError = useHandoverStore((s) => s.lastError);
  const adjustScene = useHandoverStore((s) => s.adjustScene);
  const adjustPosition = useHandoverStore((s) => s.adjustPosition);
  const syncBackup = useHandoverStore((s) => s.syncBackup);
  const takeover = useHandoverStore((s) => s.takeover);
  const { inSync, laggingRole, batchGap, consoleStatus, activeRole, lockedRole } = useHandoverSync();

  const scenes = useMemo(() => mockData.cueScene.map((cue) => cue.name), []);
  const standbyRole = activeRole === "PRIMARY" ? "BACKUP" : "PRIMARY";

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">stage-light</p>
        <h1>舞台预览 · 主备控交接台</h1>
      </div>
      <StatusBadge value={inSync ? "IN_SYNC" : "LAGGING"} />
    </section>
    <section className="metrics">
      <StatCard label="当前控台" value={ConsoleRoleText[activeRole]} />
      <StatCard label="同步批次" value={`#${activeRole === "PRIMARY" ? primary.batch : backup.batch}`} />
      <StatCard label="交接记录" value={records.length} />
    </section>
    {lastError && <p className="error-banner">{lastError}</p>}
    <section className="consoles">
      <ConsolePanel
        title="主控台"
        snapshot={primary}
        status={consoleStatus("PRIMARY")}
        active={activeRole === "PRIMARY"}
        locked={lockedRole === "PRIMARY"}
        lagging={laggingRole === "PRIMARY"}
        batchGap={batchGap}
        scenes={scenes}
        onScene={(scene) => adjustScene("PRIMARY", scene)}
        onSeek={(delta) => adjustPosition("PRIMARY", delta)}
        onTakeover={() => takeover("PRIMARY")}
      />
      <div className="sync-column">
        <button className="sync-button" onClick={syncBackup}>同步{ConsoleRoleText[standbyRole]}</button>
        {!inSync && <span className="lag-hint">{ConsoleRoleText[laggingRole ?? standbyRole]}落后 {batchGap} 批</span>}
      </div>
      <ConsolePanel
        title="备控台"
        snapshot={backup}
        status={consoleStatus("BACKUP")}
        active={activeRole === "BACKUP"}
        locked={lockedRole === "BACKUP"}
        lagging={laggingRole === "BACKUP"}
        batchGap={batchGap}
        scenes={scenes}
        onScene={(scene) => adjustScene("BACKUP", scene)}
        onSeek={(delta) => adjustPosition("BACKUP", delta)}
        onTakeover={() => takeover("BACKUP")}
      />
    </section>
    <section className="panel wide">
      <h2>交接记录</h2>
      {records.length === 0 && <p className="console-meta">暂无记录，主控调整或接管后会留痕，离开页面也不会丢失。</p>}
      <div className="table">
        {[...records].reverse().map((record, index) => <article key={`${record.at}-${index}`} className="row">
          <strong>{record.message}</strong><span>{formatDate(record.at)}</span>
        </article>)}
      </div>
    </section>
  </main>;
}
