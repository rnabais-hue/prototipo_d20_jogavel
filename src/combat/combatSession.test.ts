import { describe, expect, it } from 'vitest';
import {
  advanceCombatSessionTurn,
  createCombatSessionFromPresetId,
  getCombatSessionActiveSheet,
  getCombatSessionLife,
  getCombatSessionMovementAllowance,
  getCombatSessionOutcome,
  getCombatSessionParticipantCell,
  getCombatSessionPositioning,
  getCombatSessionRemainingMovement,
  moveCombatSessionActiveParticipant,
  restartCombatSession,
  resolveCombatSessionBasicAttack,
  resolveCombatSessionPrimaryAbility,
  resolveCombatSessionAction,
  runCombatSessionOpponentAction,
} from './combatSession';
import { getCombatCliResource } from '../cli/combatCliResources';
import { createCombatPositioningState } from './combatPositioning';

describe('createCombatSessionFromPresetId', () => {
  it('creates the default encounter session', () => {
    const session = createCombatSessionFromPresetId();

    expect(session.preset.id).toBe('training-duel');
    expect(getCombatSessionActiveSheet(session)?.displayName).toBe('Training Vanguard');
    expect(getCombatSessionOutcome(session)).toEqual({
      status: 'ongoing',
      activeTeamIds: ['team_player', 'team_opponent'],
    });
  });

  it('creates a selected encounter session', () => {
    const session = createCombatSessionFromPresetId('quick-check');

    expect(session.preset.id).toBe('quick-check');
    expect(session.preset.sheets.map((sheet) => sheet.displayName)).toEqual([
      'Training Vanguard',
      'Bruised Raider',
    ]);
    expect(getCombatSessionLife(session, 'test_opponent')).toEqual({
      current: 4,
      maximum: 4,
    });
  });

  it('seeds deterministic player and opponent cells', () => {
    const session = createCombatSessionFromPresetId();

    expect(getCombatSessionParticipantCell(session, 'player_actor')).toEqual({
      x: 2,
      y: 4,
    });
    expect(getCombatSessionParticipantCell(session, 'test_opponent')).toEqual({
      x: 6,
      y: 4,
    });
    expect(getCombatSessionPositioning(session).bounds).toEqual({
      width: 10,
      height: 8,
    });
  });

  it('starts with a full allowance owned by the active participant', () => {
    const session = createCombatSessionFromPresetId();

    expect(getCombatSessionMovementAllowance(session)).toEqual({
      participantId: 'player_actor',
      maximum: 4,
      remaining: 4,
    });
  });
});

describe('resolveCombatSessionBasicAttack', () => {
  it('resolves a basic attack with caller-supplied roll input', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    session.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };

    const result = resolveCombatSessionBasicAttack(session, { roll: 15 });

    expect(result).toMatchObject({
      ok: true,
      roll: 15,
      result: {
        outcome: 'hit',
        damage: {
          applied: true,
          amount: 4,
        },
      },
    });
    expect(getCombatSessionLife(session, 'test_opponent')).toEqual({
      current: 4,
      maximum: 8,
    });
  });
});

describe('resolveCombatSessionPrimaryAbility', () => {
  it('spends resources and resolves the primary ability', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    session.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };

    const result = resolveCombatSessionPrimaryAbility(session, { roll: 15 });

    expect(result).toMatchObject({
      ok: true,
      ability: {
        label: 'Focused Drive',
      },
      spentResource: {
        label: 'PM',
        current: 4,
        maximum: 6,
      },
      result: {
        outcome: 'hit',
        damage: {
          applied: true,
          amount: 6,
        },
      },
    });
    expect(
      getCombatCliResource(session.resources, 'player_actor', 'power')?.current,
    ).toBe(4);
    expect(getCombatSessionLife(session, 'test_opponent')?.current).toBe(2);
  });
});

describe('restartCombatSession', () => {
  it('restarts the current preset', () => {
    const session = createCombatSessionFromPresetId('quick-check');
    session.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };
    resolveCombatSessionBasicAttack(session, { roll: 20 });

    expect(getCombatSessionOutcome(session)).toEqual({
      status: 'resolved',
      winningTeamId: 'team_player',
    });

    restartCombatSession(session);

    expect(session.preset.id).toBe('quick-check');
    expect(getCombatSessionLife(session, 'test_opponent')).toEqual({
      current: 4,
      maximum: 4,
    });
    expect(getCombatSessionOutcome(session).status).toBe('ongoing');
  });

  it('restarts with a selected preset switch', () => {
    const session = createCombatSessionFromPresetId('training-duel');

    restartCombatSession(session, 'quick-check');

    expect(session.preset.id).toBe('quick-check');
    expect(getCombatSessionLife(session, 'test_opponent')).toEqual({
      current: 4,
      maximum: 4,
    });
  });

  it('resets participant positions after movement', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const movement = moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 4, y: 4 },
    });

    expect(movement.ok).toBe(true);
    expect(getCombatSessionParticipantCell(session, 'player_actor')).toEqual({
      x: 4,
      y: 4,
    });

    restartCombatSession(session);

    expect(getCombatSessionParticipantCell(session, 'player_actor')).toEqual({
      x: 2,
      y: 4,
    });
    expect(getCombatSessionParticipantCell(session, 'test_opponent')).toEqual({
      x: 6,
      y: 4,
    });
    expect(getCombatSessionMovementAllowance(session)).toEqual({
      participantId: 'player_actor',
      maximum: 4,
      remaining: 4,
    });
  });

  it('resets allowance and ownership when switching presets', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 3, y: 4 },
    });

    restartCombatSession(session, 'quick-check');

    expect(getCombatSessionMovementAllowance(session)).toEqual({
      participantId: 'player_actor',
      maximum: 4,
      remaining: 4,
    });
  });
});

describe('moveCombatSessionActiveParticipant', () => {
  it('moves the active participant up to four cells and updates positioning', () => {
    const session = createCombatSessionFromPresetId('training-duel');

    expect(
      moveCombatSessionActiveParticipant(session, {
        participantId: 'player_actor',
        destination: { x: 2, y: 0 },
      }),
    ).toEqual({
      ok: true,
      from: { x: 2, y: 4 },
      destination: { x: 2, y: 0 },
      distance: 4,
      remainingMovement: 0,
    });
    expect(getCombatSessionParticipantCell(session, 'player_actor')).toEqual({
      x: 2,
      y: 0,
    });
  });

  it('combines smaller movements up to the per-turn maximum', () => {
    const session = createCombatSessionFromPresetId('training-duel');

    expect(moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 4, y: 4 },
    })).toMatchObject({ ok: true, distance: 2, remainingMovement: 2 });
    expect(moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 4, y: 2 },
    })).toMatchObject({ ok: true, distance: 2, remainingMovement: 0 });
  });

  it('rejects movement exceeding the remaining allowance atomically', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 5, y: 4 },
    });
    const beforePositioning = getCombatSessionPositioning(session);

    expect(moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 5, y: 2 },
    })).toMatchObject({
      ok: false,
      error: {
        code: 'movement_allowance_exceeded',
        distance: 2,
        remainingMovement: 1,
      },
    });
    expect(getCombatSessionRemainingMovement(session)).toBe(1);
    expect(getCombatSessionPositioning(session)).toEqual(beforePositioning);
  });

  it('rejects positive movement after exhaustion but accepts a zero-cost no-op', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 2, y: 0 },
    });

    expect(moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 3, y: 0 },
    })).toMatchObject({ ok: false, error: { code: 'movement_allowance_exceeded' } });
    expect(moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 2, y: 0 },
    })).toMatchObject({ ok: true, distance: 0, remainingMovement: 0 });
  });

  it('does not consume allowance for positioning, inactive, or resolved rejections', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const requests = [
      { participantId: 'player_actor', destination: { x: 6, y: 4 } },
      { participantId: 'player_actor', destination: { x: -1, y: 4 } },
      { participantId: 'test_opponent', destination: { x: 5, y: 4 } },
    ];
    for (const request of requests) {
      moveCombatSessionActiveParticipant(session, request);
      expect(getCombatSessionRemainingMovement(session)).toBe(4);
    }

    const resolved = createCombatSessionFromPresetId('quick-check');
    resolved.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };
    resolveCombatSessionBasicAttack(resolved, { roll: 20 });
    moveCombatSessionActiveParticipant(resolved, {
      participantId: 'player_actor',
      destination: { x: 3, y: 4 },
    });
    expect(getCombatSessionRemainingMovement(resolved)).toBe(4);
  });

  it('gives the newly active participant a fresh allowance', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 4, y: 4 },
    });

    expect(advanceCombatSessionTurn(session).ok).toBe(true);
    expect(getCombatSessionMovementAllowance(session)).toEqual({
      participantId: 'test_opponent',
      maximum: 4,
      remaining: 4,
    });
  });

  it('rejects destinations beyond the movement allowance', () => {
    const session = createCombatSessionFromPresetId('training-duel');

    expect(
      moveCombatSessionActiveParticipant(session, {
        participantId: 'player_actor',
        destination: { x: 8, y: 4 },
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'out_of_range' },
    });
  });

  it('passes through occupied, outside-grid, and blocked positioning rejections', () => {
    const occupiedSession = createCombatSessionFromPresetId('training-duel');
    expect(
      moveCombatSessionActiveParticipant(occupiedSession, {
        participantId: 'player_actor',
        destination: { x: 6, y: 4 },
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'occupied' },
    });

    const outsideSession = createCombatSessionFromPresetId('training-duel');
    expect(
      moveCombatSessionActiveParticipant(outsideSession, {
        participantId: 'player_actor',
        destination: { x: -1, y: 4 },
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'outside_grid' },
    });

    const blockedSession = createCombatSessionFromPresetId('training-duel');
    blockedSession.positioning = createCombatPositioningState({
      bounds: blockedSession.positioning.bounds,
      placements: [
        { participantId: 'player_actor', cell: { x: 2, y: 4 } },
        { participantId: 'test_opponent', cell: { x: 6, y: 4 } },
      ],
      blockedCells: [{ x: 3, y: 4 }],
    });
    expect(
      moveCombatSessionActiveParticipant(blockedSession, {
        participantId: 'player_actor',
        destination: { x: 3, y: 4 },
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'blocked' },
    });
  });

  it('rejects movement by an inactive participant', () => {
    const session = createCombatSessionFromPresetId('training-duel');

    expect(
      moveCombatSessionActiveParticipant(session, {
        participantId: 'test_opponent',
        destination: { x: 5, y: 4 },
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'inactive_participant',
        participantId: 'test_opponent',
        activeParticipantId: 'player_actor',
      },
    });
  });

  it('rejects movement after the encounter resolves', () => {
    const session = createCombatSessionFromPresetId('quick-check');
    session.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };
    resolveCombatSessionBasicAttack(session, { roll: 20 });

    expect(
      moveCombatSessionActiveParticipant(session, {
        participantId: 'player_actor',
        destination: { x: 3, y: 4 },
      }),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'encounter_not_ongoing',
        outcome: { status: 'resolved' },
      },
    });
  });
});

describe('combat session outcome reads', () => {
  it('reads resolved outcomes after combat changes', () => {
    const session = createCombatSessionFromPresetId('quick-check');
    session.positioning.positions = {
      player_actor: { x: 5, y: 4 },
      test_opponent: { x: 6, y: 4 },
    };

    const result = resolveCombatSessionBasicAttack(session, { roll: 20 });

    expect(result).toMatchObject({
      ok: true,
      outcome: {
        status: 'resolved',
        winningTeamId: 'team_player',
      },
    });
    expect(getCombatSessionOutcome(session)).toEqual({
      status: 'resolved',
      winningTeamId: 'team_player',
    });
  });
});

describe('runCombatSessionOpponentAction', () => {
  it('runs the simple opponent action when explicitly requested on its turn', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const turn = advanceCombatSessionTurn(session);

    expect(turn.ok).toBe(true);
    expect(getCombatSessionActiveSheet(session)?.displayName).toBe('Practice Raider');

    const result = runCombatSessionOpponentAction(session, { roll: 20 });

    expect(result).toMatchObject({
      ok: true,
      attack: {
        attacker: {
          displayName: 'Practice Raider',
        },
        result: {
          outcome: 'hit',
        },
      },
      endTurn: {
        ok: true,
      },
    });
    expect(getCombatSessionLife(session, 'player_actor')?.current).toBe(9);
    expect(getCombatSessionActiveSheet(session)?.displayName).toBe('Training Vanguard');
    expect(getCombatSessionMovementAllowance(session)).toEqual({
      participantId: 'player_actor',
      maximum: 4,
      remaining: 4,
    });
  });
});

describe('Milestone 8: Attack Range Enforcement integration tests', () => {
  it('initial blade attack fails at distance 4', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const result = resolveCombatSessionBasicAttack(session, { roll: 15 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject({
        code: 'attack_out_of_range',
        distance: 4,
        maximumDistance: 1,
        weaponId: 'practice-blade',
        rangeBand: 'melee',
      });
    }
  });

  it('moving adjacent makes the blade attack legal', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    // Move 3 cells closer (from (2,4) to (5,4))
    const moveResult = moveCombatSessionActiveParticipant(session, {
      participantId: 'player_actor',
      destination: { x: 5, y: 4 },
    });
    expect(moveResult.ok).toBe(true);

    const result = resolveCombatSessionBasicAttack(session, { roll: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.outcome).toBe('hit');
    }
  });

  it('initial crossbow attack is legal at distance 4', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const result = resolveCombatSessionAction(session, 'crossbow_strike', { roll: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.outcome).toBe('hit');
    }
  });

  it('initial bow attack is legal at distance 4', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const result = resolveCombatSessionAction(session, 'bow_strike', { roll: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.outcome).toBe('hit');
    }
  });

  it('enforces range at custom distance boundaries (5, 9, 10)', () => {
    // Distance 5
    const session5 = createCombatSessionFromPresetId('training-duel');
    session5.positioning = createCombatPositioningState({
      bounds: session5.positioning.bounds,
      placements: [
        { participantId: 'player_actor', cell: { x: 2, y: 4 } },
        { participantId: 'test_opponent', cell: { x: 7, y: 4 } },
      ],
    });
    // Crossbow (range 4) fails
    const res5Crossbow = resolveCombatSessionAction(session5, 'crossbow_strike', { roll: 15 });
    expect(res5Crossbow.ok).toBe(false);
    if (!res5Crossbow.ok) {
      expect(res5Crossbow.error).toMatchObject({
        code: 'attack_out_of_range',
        distance: 5,
        maximumDistance: 4,
      });
    }
    // Bow (range 9) succeeds
    const res5Bow = resolveCombatSessionAction(session5, 'bow_strike', { roll: 15 });
    expect(res5Bow.ok).toBe(true);

    // Distance 9
    const session9 = createCombatSessionFromPresetId('training-duel');
    session9.positioning = createCombatPositioningState({
      bounds: session9.positioning.bounds,
      placements: [
        { participantId: 'player_actor', cell: { x: 0, y: 4 } },
        { participantId: 'test_opponent', cell: { x: 9, y: 4 } },
      ],
    });
    // Bow (range 9) succeeds
    const res9Bow = resolveCombatSessionAction(session9, 'bow_strike', { roll: 15 });
    expect(res9Bow.ok).toBe(true);

    // Distance 10
    const session10 = createCombatSessionFromPresetId('training-duel');
    session10.positioning = createCombatPositioningState({
      bounds: session10.positioning.bounds,
      placements: [
        { participantId: 'player_actor', cell: { x: 0, y: 0 } },
        { participantId: 'test_opponent', cell: { x: 9, y: 1 } },
      ],
    });
    // Bow (range 9) fails
    const res10Bow = resolveCombatSessionAction(session10, 'bow_strike', { roll: 15 });
    expect(res10Bow.ok).toBe(false);
    if (!res10Bow.ok) {
      expect(res10Bow.error).toMatchObject({
        code: 'attack_out_of_range',
        distance: 10,
        maximumDistance: 9,
      });
    }
  });

  it('out-of-range attack does not call the roller', () => {
    let rollerCalled = false;
    const rollerMock = {
      rollD20: () => {
        rollerCalled = true;
        return 10;
      },
    };
    const session = createCombatSessionFromPresetId('training-duel', { roller: rollerMock });
    const result = resolveCombatSessionBasicAttack(session);
    expect(result.ok).toBe(false);
    expect(rollerCalled).toBe(false);
  });

  it('out-of-range attack does not consume main action, change HP, positioning, or movement allowance', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const startHp = getCombatSessionLife(session, 'test_opponent')?.current;
    const startPos = getCombatSessionParticipantCell(session, 'player_actor');
    const startAllowance = getCombatSessionRemainingMovement(session);

    const result = resolveCombatSessionBasicAttack(session, { roll: 15 });
    expect(result.ok).toBe(false);

    expect(session.encounter.activeTurn.mainActionAvailable).toBe(true);
    expect(getCombatSessionLife(session, 'test_opponent')?.current).toBe(startHp);
    expect(getCombatSessionParticipantCell(session, 'player_actor')).toEqual(startPos);
    expect(getCombatSessionRemainingMovement(session)).toBe(startAllowance);
  });

  it('out-of-range primary ability does not spend resources or consume main action', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const startPower = getCombatCliResource(session.resources, 'player_actor', 'power')?.current;

    const result = resolveCombatSessionPrimaryAbility(session, { roll: 15 });
    expect(result.ok).toBe(false);

    expect(getCombatCliResource(session.resources, 'player_actor', 'power')?.current).toBe(startPower);
    expect(session.encounter.activeTurn.mainActionAvailable).toBe(true);
  });

  it('legal attacks still use the existing hit/damage pipeline', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const startHp = getCombatSessionLife(session, 'test_opponent')?.current ?? 0;

    const result = resolveCombatSessionAction(session, 'crossbow_strike', { roll: 20 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.outcome).toBe('hit');
      expect(result.result.damage.applied).toBe(true);
      if (result.result.damage.applied) {
        expect(getCombatSessionLife(session, 'test_opponent')?.current).toBe(startHp - result.result.damage.amount);
      }
      expect(session.encounter.activeTurn.mainActionAvailable).toBe(false);
    }
  });

  it('opponent automation does not become stuck and resolved combat rejects further attacks', () => {
    const session = createCombatSessionFromPresetId('training-duel');
    const turn = advanceCombatSessionTurn(session);
    expect(turn.ok).toBe(true);

    // Opponent uses practice-crossbow which is short range (max 4). Starting distance is 4.
    // Opponent action should resolve successfully (hit or miss) and advance the turn back to player.
    const result = runCombatSessionOpponentAction(session, { roll: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.attack.ok).toBe(true);
      expect(result.outcome.status).toBe('ongoing');
    }

    // Resolve the combat by landing a critical hit to defeat opponent (player's turn was auto-advanced)
    const opponentLife = getCombatSessionLife(session, 'test_opponent');
    if (opponentLife) {
      opponentLife.current = 4;
    }
    const finalAttack = resolveCombatSessionAction(session, 'bow_strike', { roll: 20 });
    expect(finalAttack.ok).toBe(true);
    expect(getCombatSessionOutcome(session).status).toBe('resolved');

    // Trying to attack again should be rejected with encounter_not_ongoing
    const lateAttack = resolveCombatSessionAction(session, 'bow_strike', { roll: 20 });
    expect(lateAttack.ok).toBe(false);
    if (!lateAttack.ok) {
      expect(lateAttack.error.code).toBe('encounter_not_ongoing');
    }
  });
});
