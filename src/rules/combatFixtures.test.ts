import { describe, expect, it, vi } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import {
  COMBAT_FIXTURE_IDS,
  createMinimalCombatEncounterFixture,
} from './combatFixtures';
import { getEncounterOutcome } from './tacticalEncounter';

describe('createMinimalCombatEncounterFixture', () => {
  it('creates a valid encounter with generic participants', () => {
    const fixture = createMinimalCombatEncounterFixture();

    expect(fixture.encounter.id).toBe('test_encounter');
    expect(fixture.player.id).toBe('player_actor');
    expect(fixture.opponent.id).toBe('test_opponent');
    expect(fixture.encounter.participants.map((participant) => participant.id)).toEqual([
      'player_actor',
      'test_opponent',
    ]);
    expect(fixture.events.map((event) => event.type)).toEqual([
      'encounter_started',
      'turn_started',
    ]);
  });

  it('puts the player and opponent on opposite teams', () => {
    const { encounter, ids } = createMinimalCombatEncounterFixture();

    expect(
      encounter.participants.find((participant) => participant.id === ids.playerId)?.teamId,
    ).toBe('team_player');
    expect(
      encounter.participants.find((participant) => participant.id === ids.opponentId)
        ?.teamId,
    ).toBe('team_opponent');
  });

  it('gives the playable participant an offensive action from catalog data', () => {
    const { encounter, ids } = createMinimalCombatEncounterFixture();
    const player = encounter.participants.find(
      (participant) => participant.id === ids.playerId,
    );
    const action = mvpTacticalCatalogs.actions.find(
      (definition) => definition.id === ids.offensiveActionId,
    );

    expect(player?.actionIds).toContain(COMBAT_FIXTURE_IDS.offensiveAction);
    expect(action?.kind).toBe('offensive');
  });

  it('gives the opponent initial life', () => {
    const { encounter, ids } = createMinimalCombatEncounterFixture();

    expect(
      encounter.participants.find((participant) => participant.id === ids.opponentId)?.life,
    ).toEqual({
      current: 8,
      maximum: 8,
    });
  });

  it('preserves supplied turn order', () => {
    const fixture = createMinimalCombatEncounterFixture({
      turnOrder: ['test_opponent', 'player_actor'],
    });

    expect(fixture.encounter.turnOrder).toEqual(['test_opponent', 'player_actor']);
    expect(fixture.encounter.activeTurn.participantId).toBe('test_opponent');
  });

  it('starts without defeated participants by default', () => {
    const { encounter } = createMinimalCombatEncounterFixture();

    expect(encounter.participants.map((participant) => participant.defeated)).toEqual([
      false,
      false,
    ]);
  });

  it('allows explicit defeated life overrides', () => {
    const { encounter, ids } = createMinimalCombatEncounterFixture({
      playerLife: { current: 0, maximum: 12 },
      turnOrder: ['player_actor', 'test_opponent'],
    });

    expect(
      encounter.participants.find((participant) => participant.id === ids.playerId)
        ?.defeated,
    ).toBe(true);
    expect(encounter.turnOrder).toEqual(['player_actor', 'test_opponent']);
    expect(encounter.activeTurn.participantId).toBe('test_opponent');
  });

  it('allows overrides for life, ids, turn order, and actions', () => {
    const fixture = createMinimalCombatEncounterFixture({
      encounterId: 'custom_encounter',
      player: {
        id: 'custom_player',
        actionIds: ['basic_strike'],
      },
      opponent: {
        id: 'custom_opponent',
      },
      playerLife: { maximum: 15 },
      opponentLife: { current: 2, maximum: 9 },
      turnOrder: ['custom_opponent', 'custom_player'],
    });

    expect(fixture.encounter.id).toBe('custom_encounter');
    expect(fixture.ids.playerId).toBe('custom_player');
    expect(fixture.ids.opponentId).toBe('custom_opponent');
    expect(fixture.encounter.turnOrder).toEqual(['custom_opponent', 'custom_player']);
    expect(fixture.encounter.participants.map((participant) => participant.life)).toEqual([
      { current: 15, maximum: 15 },
      { current: 2, maximum: 9 },
    ]);
    expect(fixture.player.actionIds).toContain('basic_strike');
  });

  it('returns ongoing outcome for the initial encounter', () => {
    const { encounter } = createMinimalCombatEncounterFixture();

    expect(getEncounterOutcome(encounter)).toEqual({
      status: 'ongoing',
      activeTeamIds: ['team_player', 'team_opponent'],
    });
  });

  it('does not depend on Phaser, browser APIs, or randomness', () => {
    const random = vi.spyOn(Math, 'random');

    createMinimalCombatEncounterFixture();

    expect(random).not.toHaveBeenCalled();
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    random.mockRestore();
  });
});
