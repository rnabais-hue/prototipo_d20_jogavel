import { describe, expect, it } from 'vitest';
import { advanceCombatSessionTurn, createCombatSessionFromPresetId, getCombatSessionLife, resolveCombatSessionAction } from '../../combat/combatSession';
import { projectDebugCombatAttackAvailability } from './debugCombatAttackAvailability';

const PLAYER_ID = 'player_actor';
const OPPONENT_ID = 'test_opponent';

describe('debug combat attack availability', () => {
  it('reports blade blocked and both ranged weapons ready at initial distance four', () => {
    const items = projectDebugCombatAttackAvailability(createCombatSessionFromPresetId(), PLAYER_ID);
    expect(items.map(({ weaponId, available, reason, distance }) => ({ weaponId, available, reason, distance }))).toEqual([
      { weaponId: 'practice-blade', available: false, reason: 'out_of_range', distance: 4 },
      { weaponId: 'training-crossbow', available: true, reason: 'in_range', distance: 4 },
      { weaponId: 'training-bow', available: true, reason: 'in_range', distance: 4 },
    ]);
  });

  it('reports every weapon in range at adjacent distance one', () => {
    const session = createCombatSessionFromPresetId();
    session.positioning = { ...session.positioning, positions: { ...session.positioning.positions, [PLAYER_ID]: { x: 5, y: 4 } } };
    expect(projectDebugCombatAttackAvailability(session, PLAYER_ID).every((item) => item.available && item.distance === 1)).toBe(true);
  });

  it.each([PLAYER_ID, OPPONENT_ID])('reports a missing position for %s', (participantId) => {
    const session = createCombatSessionFromPresetId();
    session.positioning = {
      ...session.positioning,
      positions: Object.fromEntries(Object.entries(session.positioning.positions).filter(([id]) => id !== participantId)),
    };
    expect(projectDebugCombatAttackAvailability(session, PLAYER_ID).every((item) => item.reason === 'missing_position')).toBe(true);
  });

  it('reports resolved combat, opponent turn and consumed main action', () => {
    const opponentTurn = createCombatSessionFromPresetId();
    expect(advanceCombatSessionTurn(opponentTurn).ok).toBe(true);
    expect(projectDebugCombatAttackAvailability(opponentTurn, PLAYER_ID).every((item) => item.reason === 'not_player_turn')).toBe(true);

    const consumed = createCombatSessionFromPresetId();
    expect(resolveCombatSessionAction(consumed, 'crossbow_strike', { roll: 1 }).ok).toBe(true);
    expect(projectDebugCombatAttackAvailability(consumed, PLAYER_ID).every((item) => item.reason === 'main_action_unavailable')).toBe(true);

    const resolved = createCombatSessionFromPresetId();
    resolved.positioning = { ...resolved.positioning, positions: { ...resolved.positioning.positions, [PLAYER_ID]: { x: 5, y: 4 } } };
    const opponentLife = getCombatSessionLife(resolved, OPPONENT_ID);
    if (opponentLife) opponentLife.current = 1;
    expect(resolveCombatSessionAction(resolved, 'bow_strike', { roll: 20 }).ok).toBe(true);
    expect(projectDebugCombatAttackAvailability(resolved, PLAYER_ID).every((item) => item.reason === 'encounter_resolved')).toBe(true);
  });

  it('uses each action weapon and does not depend on positioning entry order', () => {
    const session = createCombatSessionFromPresetId();
    session.positioning.positions = Object.fromEntries(Object.entries(session.positioning.positions).reverse());
    const items = projectDebugCombatAttackAvailability(session, PLAYER_ID);
    expect(items.map((item) => [item.actionId, item.weaponId, item.maximumDistance])).toEqual([
      ['basic_strike', 'practice-blade', 1],
      ['crossbow_strike', 'training-crossbow', 4],
      ['bow_strike', 'training-bow', 9],
    ]);
  });
});
