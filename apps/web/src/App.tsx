import { gameContent } from "@runemark/content";
import { experienceForSkill } from "@runemark/domain";
import { BANKING_DURATION_MS } from "@runemark/engine";
import { OfflineSummary } from "./game/OfflineSummary";
import { useGame } from "./game/use-game";

function formatDuration(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function displayName(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function App() {
  const {
    game,
    offlineReport,
    loadError,
    storageError,
    startActivity,
    stopActivity,
    dismissOfflineReport,
    resetSave,
  } = useGame();

  if (!game) {
    return (
      <main className="game-shell">
        <h1>Unable to load Runemark</h1>
        <p>{loadError}</p>
        <p>Your existing save has not been overwritten.</p>
        {storageError && <p role="alert">{storageError}</p>}
        <button type="button" className="action-button" onClick={resetSave}>
          Start a new game
        </button>
      </main>
    );
  }

  const location = gameContent.locations[game.character.locationId];
  const region = location ? gameContent.regions[location.regionId] : undefined;

  const availableSites = Object.values(gameContent.sites)
    .filter((site) => site.locationId === game.character.locationId)
    .flatMap((site) => {
      const activity = gameContent.activities[site.activityId];
      return activity ? [{ site, activity }] : [];
    });

  const session = game.activeActivity;
  const banking = session?.phase === "banking";
  const traveling =
    session?.phase === "travel-to-bank" || session?.phase === "travel-to-site";
  const currentLeg = session?.travel?.legs[session.travel.index];

  const selectedSite = session ? gameContent.sites[session.siteId] : undefined;

  const selectedActivity = selectedSite
    ? gameContent.activities[selectedSite.activityId]
    : undefined;
  const phaseDuration = banking
    ? BANKING_DURATION_MS
    : traveling
      ? (currentLeg?.durationMs ?? 0)
      : (selectedActivity?.durationMs ?? 0);

  const phaseLabel = banking
    ? "Banking resources"
    : traveling
      ? session?.phase === "travel-to-bank"
        ? "Traveling to bank"
        : "Traveling to activity site"
      : "Gathering resources";

  const progress =
    session && phaseDuration > 0
      ? Math.min(100, (session.elapsedMs / phaseDuration) * 100)
      : 0;

  const backpack = game.character.backpack;
  const usedSlots = backpack.slots.length;
  const capacity = backpack.capacity ?? usedSlots;
  const inventoryPercent = capacity > 0 ? (usedSlots / capacity) * 100 : 0;

  const bankItems = Object.entries(game.bank.items).sort(([first], [second]) =>
    (gameContent.items[first]?.name ?? first).localeCompare(
      gameContent.items[second]?.name ?? second,
    ),
  );

  const skills = [
    ...new Set(
      Object.values(gameContent.activities).map((activity) => activity.skillId),
    ),
  ].sort();

  return (
    <div className="game-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">A Norse-inspired idle RPG</p>
          <h1>RUNEMARK</h1>
        </div>

        <div className="location-label">
          <span>{region?.name ?? "Unknown region"}</span>
          <strong>{location?.name ?? game.character.locationId}</strong>
        </div>
      </header>

      {storageError && (
        <p role="alert" className="storage-warning">
          {storageError}
        </p>
      )}

      {offlineReport && (
        <OfflineSummary
          report={offlineReport}
          onDismiss={dismissOfflineReport}
        />
      )}

      <div className="game-grid">
        <aside className="panel site-panel">
          <div className="panel-heading">
            <h2>Activities</h2>
            <p>Choose what to train</p>
          </div>

          <div className="site-list">
            {availableSites.map(({ site, activity }) => {
              const selected = session?.siteId === site.id;
              const active = selected && session?.status === "running";

              return (
                <button
                  key={site.id}
                  type="button"
                  className={`site-button ${selected ? "selected" : ""}`}
                  onClick={() => startActivity(site.id)}
                  disabled={active}
                  aria-pressed={selected}
                >
                  <span className="site-skill">
                    {displayName(activity.skillId)}
                  </span>
                  <strong>{activity.name}</strong>
                  <span className="site-details">
                    {formatDuration(activity.durationMs)} per action
                  </span>
                  {selected && (
                    <span className="site-state">
                      {active ? "Selected" : "Blocked"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="panel activity-panel">
          <p className="eyebrow">Current activity</p>

          {session && selectedActivity ? (
            <>
              <div className="activity-symbol">
                {banking ? "B" : displayName(selectedActivity.skillId)[0]}
              </div>

              <p className="activity-status">{phaseLabel}</p>

              <h2>{selectedActivity.name}</h2>

              <p className="activity-subtitle">
                {banking
                  ? "Depositing gathered resources into the bank."
                  : `${selectedActivity.experiencePerAction} XP per action`}
              </p>

              <div className="activity-progress">
                <div className="progress-info">
                  <span>{banking ? "Banking" : "Action progress"}</span>
                  <span>
                    {session.status === "blocked"
                      ? "Blocked"
                      : `${formatDuration(Math.max(0, phaseDuration - session.elapsedMs))} remaining`}
                  </span>
                </div>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label={
                    banking ? "Banking progress" : "Activity progress"
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.floor(progress)}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="action-button secondary"
                onClick={stopActivity}
              >
                Stop activity
              </button>
            </>
          ) : (
            <div className="activity-empty">
              <div className="activity-symbol">R</div>
              <h2>Begin your journey</h2>
              <p>Select Woodcutting or Mining to start gathering.</p>
            </div>
          )}
        </main>

        <aside className="resource-panel">
          <section className="panel">
            <div className="resource-heading">
              <h2>Backpack</h2>
              <span>
                {usedSlots} / {capacity} slots
              </span>
            </div>

            <div className="capacity-track">
              <div style={{ width: `${inventoryPercent}%` }} />
            </div>

            <div className="inventory-grid">
              {Array.from({ length: capacity }, (_, index) => {
                const slot = backpack.slots[index];
                const itemName = slot
                  ? (gameContent.items[slot.itemId]?.name ?? slot.itemId)
                  : "Empty slot";

                return (
                  <div
                    className={`inventory-slot ${slot ? "occupied" : ""}`}
                    // biome-ignore lint/suspicious/noArrayIndexKey: index is positional and fixed.
                    key={index}
                    title={slot ? `${itemName} x${slot.quantity}` : itemName}
                  >
                    {slot && (
                      <>
                        <span className="item-initial">
                          {itemName.charAt(0)}
                        </span>
                        {slot.quantity > 1 && (
                          <span className="item-count">{slot.quantity}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="resource-heading">
              <h2>Bank</h2>
              <span>{bankItems.length} item types</span>
            </div>

            {bankItems.length === 0 ? (
              <p className="empty-message">
                Your bank is empty. Resources will be deposited automatically.
              </p>
            ) : (
              <ul className="bank-list">
                {bankItems.map(([itemId, quantity]) => (
                  <li key={itemId}>
                    <span>{gameContent.items[itemId]?.name ?? itemId}</span>
                    <strong>{quantity.toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className="panel skills-panel">
        <h2>Skills</h2>
        <div className="skills-list">
          {skills.map((skillId) => (
            <div className="skill-entry" key={skillId}>
              <strong>{displayName(skillId)}</strong>
              <span>
                {experienceForSkill(
                  game.character.skills,
                  skillId,
                ).toLocaleString()}{" "}
                XP
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="game-footer">
        Runemark · Early development prototype
      </footer>
    </div>
  );
}

export default App;
