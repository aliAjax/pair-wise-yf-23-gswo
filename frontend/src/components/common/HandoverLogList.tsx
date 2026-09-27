import type { HandoverLogEntry } from "../../types/Handover";
import { HANDOVER_ACTION_TEXT } from "../../constants/handoverLogTemplates";
import { formatDate } from "../../utils/formatters";
import { EmptyState } from "./EmptyState";

export function HandoverLogList({ logs }: { logs: HandoverLogEntry[] }) {
  if (logs.length === 0) return <EmptyState title="暂无交接记录" />;
  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id} className={`log-item ${log.action === "TAKEOVER_REJECTED" ? "rejected" : ""}`}>
          <span className="badge">{HANDOVER_ACTION_TEXT[log.action] ?? log.action}</span>
          <span className="log-message">{log.message}</span>
          <time>{formatDate(log.at)}</time>
        </li>
      ))}
    </ul>
  );
}
