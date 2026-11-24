import { gameContent } from "@runemark/content";
import { useEffect, useRef } from "react";
import type { OfflineReport } from "./offline-report";

interface Props {
  readonly report: OfflineReport;
  readonly onDismiss: () => void;
}

function formatAwayDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60_000);
  const hours = Math.floor(minutes / 60);

  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function OfflineSummary({ report, onDismiss }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { summary, events } = report;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    return () => dialog.close();
  }, []);

  const items = Object.entries(summary.itemsGained);
  const experience = Object.entries(summary.experienceGained);

  return (
    <dialog ref={dialogRef} className="offline-dialog" onClose={onDismiss}>
      <p className="eyebrow">Welcome back</p>
      <h2>While you were away</h2>
      <p className="offline-duration">
        {formatAwayDuration(report.elapsedMs)} elapsed
      </p>

      <dl className="offline-stats">
        <div>
          <dt>Actions completed</dt>
          <dd>{summary.completedActions.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Bank trips</dt>
          <dd>{summary.bankTrips.toLocaleString()}</dd>
        </div>
      </dl>

      {items.length > 0 && (
        <section>
          <h3>Resources collected</h3>
          <ul className="bank-list">
            {items.map(([itemId, quantity]) => (
              <li key={itemId}>
                <span>{gameContent.items[itemId]?.name ?? itemId}</span>
                <strong>+{quantity.toLocaleString()}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <h3>Experience gained</h3>
          <ul className="bank-list">
            {experience.map(([skillId, xp]) => (
              <li key={skillId}>
                <span>{skillId}</span>
                <strong>+{xp.toLocaleString()} XP</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {events.some((event) => event.type === "ACTIVITY_BLOCKED") && (
        <p className="offline-warning">
          Your activity was interrupted while you were away.
        </p>
      )}

      <button type="button" className="action-button" onClick={onDismiss}>
        Continue
      </button>
    </dialog>
  );
}
