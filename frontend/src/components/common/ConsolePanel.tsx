import type { ConsoleState } from "../../types/Handover";
import { ConsoleRoleText } from "../../constants/ConsoleRole";
import { SHOW_SCENES } from "../../constants/showScenes";
import { formatPlayTime } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { StageCanvas } from "./StageCanvas";

const TIME_STEPS = [
  { label: "-30s", delta: -30_000 },
  { label: "-5s", delta: -5_000 },
  { label: "+5s", delta: 5_000 },
  { label: "+30s", delta: 30_000 }
];

interface ConsolePanelProps {
  consoleState: ConsoleState;
  isActive: boolean;
  lagging: boolean;
  batchGap: number;
  onAdjustScene: (sceneId: number) => void;
  onAdjustTime: (deltaMs: number) => void;
  onSync: () => void;
  onTakeover: () => void;
}

export function ConsolePanel({
  consoleState,
  isActive,
  lagging,
  batchGap,
  onAdjustScene,
  onAdjustTime,
  onSync,
  onTakeover
}: ConsolePanelProps) {
  const scene = SHOW_SCENES.find((item) => item.id === consoleState.sceneId) ?? SHOW_SCENES[0];
  const canOperate = isActive && !consoleState.locked;
  const theme = consoleState.locked ? "locked" : isActive ? "active" : lagging ? "lagging" : "standby";

  return (
    <article className={`console ${theme}`}>
      <header className="console-head">
        <h3>{ConsoleRoleText[consoleState.role]}</h3>
        <div className="console-badges">
          <StatusBadge value={isActive ? "主控中" : "备控中"} />
          {consoleState.locked && <StatusBadge value="已锁定" />}
          {lagging && <span className="badge lag">落后 {batchGap} 批</span>}
        </div>
      </header>

      <StageCanvas title="舞台预览" value={scene.name} />

      <dl className="kv">
        <div><dt>当前场景</dt><dd>{scene.name}</dd></div>
        <div><dt>播放时刻</dt><dd>{formatPlayTime(consoleState.playMs)}</dd></div>
        <div><dt>同步批次</dt><dd>#{consoleState.batch}</dd></div>
      </dl>

      {consoleState.locked && (
        <p className="console-note warn">已暂时失去控制，等待主控执行「同步备控」后才能操作。</p>
      )}
      {!isActive && !consoleState.locked && lagging && (
        <p className="console-note warn">备控落后主控 {batchGap} 个批次，接管前请先由主控同步。</p>
      )}
      {!isActive && !consoleState.locked && !lagging && (
        <p className="console-note ok">状态已与主控取齐，可随时接管。</p>
      )}

      <div className="console-controls">
        <label className="scene-picker">
          <span>切换场景</span>
          <select
            value={consoleState.sceneId}
            disabled={!canOperate}
            onChange={(event) => onAdjustScene(Number(event.target.value))}
          >
            {SHOW_SCENES.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="time-steps">
          {TIME_STEPS.map((step) => (
            <button
              key={step.label}
              type="button"
              className="handover-btn"
              disabled={!canOperate}
              onClick={() => onAdjustTime(step.delta)}
            >
              {step.label}
            </button>
          ))}
          <button type="button" className="handover-btn" disabled={!canOperate} onClick={() => onAdjustTime(-consoleState.playMs)}>
            归零
          </button>
        </div>
      </div>

      <footer className="console-actions">
        {isActive ? (
          <button type="button" className="handover-btn primary" disabled={consoleState.locked} onClick={onSync}>
            同步备控
          </button>
        ) : (
          <button type="button" className="handover-btn danger" disabled={consoleState.locked} onClick={onTakeover}>
            请求接管
          </button>
        )}
      </footer>
    </article>
  );
}
