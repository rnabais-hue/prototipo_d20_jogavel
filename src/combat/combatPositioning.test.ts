import { describe, expect, it } from 'vitest';
import {
  createCombatPositioningState,
  getCombatParticipantCell,
  isCombatCellBlocked,
  isCombatCellOccupied,
  moveCombatParticipant,
  validateCombatMovementDestination,
} from './combatPositioning';

describe('createCombatPositioningState', () => {
  it('creates a positioning state from participant placements', () => {
    const state = createCombatPositioningState({
      bounds: { width: 6, height: 5 },
      placements: [
        { participantId: 'player_actor', cell: { x: 1, y: 2 } },
        { participantId: 'test_opponent', cell: { x: 4, y: 2 } },
      ],
      blockedCells: [{ x: 3, y: 3 }],
    });

    expect(state).toEqual({
      bounds: { width: 6, height: 5 },
      positions: {
        player_actor: { x: 1, y: 2 },
        test_opponent: { x: 4, y: 2 },
      },
      blockedCells: [{ x: 3, y: 3 }],
    });
  });

  it('keeps later input mutations from changing the state', () => {
    const playerCell = { x: 1, y: 2 };
    const blockedCell = { x: 3, y: 3 };
    const state = createCombatPositioningState({
      bounds: { width: 6, height: 5 },
      placements: [{ participantId: 'player_actor', cell: playerCell }],
      blockedCells: [blockedCell],
    });

    playerCell.x = 5;
    blockedCell.y = 1;

    expect(getCombatParticipantCell(state, 'player_actor')).toEqual({ x: 1, y: 2 });
    expect(state.blockedCells).toEqual([{ x: 3, y: 3 }]);
  });
});

describe('combat positioning read helpers', () => {
  const state = createCombatPositioningState({
    bounds: { width: 6, height: 5 },
    placements: [
      { participantId: 'player_actor', cell: { x: 1, y: 2 } },
      { participantId: 'test_opponent', cell: { x: 4, y: 2 } },
    ],
    blockedCells: [{ x: 3, y: 3 }],
  });

  it('reads participant cells without exposing state mutation', () => {
    const cell = getCombatParticipantCell(state, 'player_actor');

    expect(cell).toEqual({ x: 1, y: 2 });

    if (cell) {
      cell.x = 5;
    }

    expect(getCombatParticipantCell(state, 'player_actor')).toEqual({ x: 1, y: 2 });
  });

  it('returns undefined for unknown participants', () => {
    expect(getCombatParticipantCell(state, 'missing_actor')).toBeUndefined();
  });

  it('checks occupied cells with an optional ignored participant', () => {
    expect(isCombatCellOccupied(state, { x: 4, y: 2 })).toBe(true);
    expect(
      isCombatCellOccupied(state, { x: 4, y: 2 }, {
        ignoreParticipantId: 'test_opponent',
      }),
    ).toBe(false);
  });

  it('checks blocked cells', () => {
    expect(isCombatCellBlocked(state, { x: 3, y: 3 })).toBe(true);
    expect(isCombatCellBlocked(state, { x: 2, y: 3 })).toBe(false);
  });
});

describe('validateCombatMovementDestination', () => {
  const state = createCombatPositioningState({
    bounds: { width: 6, height: 5 },
    placements: [
      { participantId: 'player_actor', cell: { x: 1, y: 2 } },
      { participantId: 'test_opponent', cell: { x: 4, y: 2 } },
    ],
    blockedCells: [{ x: 2, y: 3 }],
  });

  it('accepts a destination inside range', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'player_actor',
        destination: { x: 2, y: 2 },
        range: 2,
      }),
    ).toEqual({
      ok: true,
      from: { x: 1, y: 2 },
      destination: { x: 2, y: 2 },
      distance: 1,
    });
  });

  it('rejects an unknown participant', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'missing_actor',
        destination: { x: 2, y: 2 },
        range: 2,
      }),
    ).toEqual({
      ok: false,
      reason: 'unknown_participant',
      participantId: 'missing_actor',
      destination: { x: 2, y: 2 },
    });
  });

  it('rejects a destination outside the grid', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'player_actor',
        destination: { x: 6, y: 2 },
        range: 8,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'outside_grid',
    });
  });

  it('rejects an occupied destination', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'player_actor',
        destination: { x: 4, y: 2 },
        range: 8,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'occupied',
    });
  });

  it('rejects a blocked destination', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'player_actor',
        destination: { x: 2, y: 3 },
        range: 8,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'blocked',
    });
  });

  it('rejects an out-of-range destination', () => {
    expect(
      validateCombatMovementDestination(state, {
        participantId: 'player_actor',
        destination: { x: 3, y: 2 },
        range: 1,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'out_of_range',
    });
  });
});

describe('moveCombatParticipant', () => {
  it('returns a new state when movement is legal', () => {
    const state = createCombatPositioningState({
      bounds: { width: 6, height: 5 },
      placements: [
        { participantId: 'player_actor', cell: { x: 1, y: 2 } },
        { participantId: 'test_opponent', cell: { x: 4, y: 2 } },
      ],
      blockedCells: [{ x: 3, y: 3 }],
    });

    const result = moveCombatParticipant(state, {
      participantId: 'player_actor',
      destination: { x: 2, y: 2 },
      range: 2,
    });

    expect(result).toMatchObject({
      ok: true,
      from: { x: 1, y: 2 },
      destination: { x: 2, y: 2 },
      distance: 1,
    });

    if (!result.ok) {
      throw new Error('Expected legal movement.');
    }

    expect(result.state).not.toBe(state);
    expect(getCombatParticipantCell(state, 'player_actor')).toEqual({ x: 1, y: 2 });
    expect(getCombatParticipantCell(result.state, 'player_actor')).toEqual({
      x: 2,
      y: 2,
    });
    expect(getCombatParticipantCell(result.state, 'test_opponent')).toEqual({
      x: 4,
      y: 2,
    });
  });

  it('returns the structured rejection when movement is illegal', () => {
    const state = createCombatPositioningState({
      bounds: { width: 6, height: 5 },
      placements: [{ participantId: 'player_actor', cell: { x: 1, y: 2 } }],
    });

    expect(
      moveCombatParticipant(state, {
        participantId: 'player_actor',
        destination: { x: 5, y: 2 },
        range: 1,
      }),
    ).toMatchObject({
      ok: false,
      reason: 'out_of_range',
    });
  });
});
