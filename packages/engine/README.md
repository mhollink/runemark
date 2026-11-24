# @runemark/engine

A deterministic, platform-independent simulation engine for Runemark. The engine
advances game state using absolute Unix timestamps in milliseconds and has no
dependency on React, browser storage, or platform-specific timers.

## Public API

- `advanceGame(state, until)` advances the selected activity to a timestamp.
- `executeCommand(state, command, at)` advances existing work before starting or
  stopping an activity.
- `getPlayerCombatStats(character)` calculates effective player combat statistics.

## Architecture

Activity handlers implement gathering, production, and combat mechanics. The
shared activity lifecycle coordinates time advancement, travel, banking, phase
transitions, experience, and simulation reporting. Activity-specific restocking
can run after the common banking operation.

Static definitions come from `@runemark/content`; immutable state operations and
models come from `@runemark/domain`. The internal `simulateGame` and
`executeGameCommand` functions accept content explicitly for test fixtures.

## Simulation guarantees

- Input game state is never mutated; mutable runtime references are invocation-local.
- Only one activity is active at a time, and partial progress is preserved.
- Random outcomes depend on persisted RNG state and resolution order.
- Experience is awarded at action completion; Constitution determines maximum HP.
- Completed bank visits restore health and deposit the backpack.
- Blocked activities do not perform further gameplay until another command.
- Advancing once or in chunks should produce identical final game state.

## Testing

Unit tests cover encounter and navigation mechanics. Integration tests cover
activity lifecycles, banking, and deterministic offline progression.

Equipment, skill requirements, automatic food consumption, configurable restocking,
natural regeneration, and travel requirements remain future work.
