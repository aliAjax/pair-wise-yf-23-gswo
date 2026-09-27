import type { ConsoleSnapshot } from "../../types/Handover";
import type { HandoverStatus } from "../../constants/HandoverStatus";
import { HandoverStatusText } from "../../constants/HandoverStatus";
import { StatusBadge } from "./StatusBadge";
import { formatPlaybackMs } from "../../utils/formatters";

interface ConsolePanelProps {
  title: string;
  snapshot: ConsoleSnapshot;
  status: HandoverStatus;
  active: boolean;
  locked: boolean;
  lagging: boolean;
  batchGap: number;
  scenes: string[];
  onScene: (sceneName: string) => void;
  onSeek: (deltaMs: number) => void;
  onTakeover: () => void;
}

export function ConsolePanel({ title, snapshot, status, active, locked, lagging, batchGap, scenes, onScene, onSeek, onTakeover }: ConsolePanelProps) {
  const canOperate = active && !locked;
  return <div className={"panel console" + (active ? " controlling" : "") + (locked ? " locked" : "")}>
    <h2>
      {title}
      {active && <span className="badge controlling">控制中</span>}
      <StatusBadge value={status} />
    </h2>
    <div className="console-readout">
      <div><span>当前场景</span><strong>{snapshot.sceneName}</strong></div>
      <div><span>播放时刻</span><strong>{formatPlaybackMs(snapshot.positionMs)}</strong></div>
      <div><span>同步批次</span><strong>#{snapshot.batch}</strong></div>
    </div>
    {lagging && <p className="lag-warning">落后对端 {batchGap} 个批次，需同步后才能接管</p>}
    {locked && <p className="lag-warning">已失去控制，等待再次同步</p>}
    <div className="console-actions">
      <select value={snapshot.sceneName} disabled={!canOperate} onChange={(event) => onScene(event.target.value)}>
        {scenes.map((scene) => <option key={scene} value={scene}>{scene}</option>)}
      </select>
      <button disabled={!canOperate} onClick={() => onSeek(-5000)}>-5s</button>
      <button disabled={!canOperate} onClick={() => onSeek(5000)}>+5s</button>
      {!active && <button className="takeover" disabled={locked} onClick={onTakeover}>接管</button>}
    </div>
    <p className="console-meta">{HandoverStatusText[status]} · 更新于 {new Date(snapshot.updatedAt).toLocaleTimeString("zh-CN")}</p>
  </div>;
}
