import { describe, expect, it } from 'vitest';
import { mapMovementToEvent, mapAttackToEvents } from './presentationEvents';
import type { CombatSessionResolvedAttack, CombatSessionMovementResult } from '../../combat/combatSession';
import type { GridCell } from '../../movement/grid';

// Helper to create fully typed CombatResolvedSheet mocks
const createMockSheet = (id: string, name: string, team: string, hp: number) => ({
  participantId: id,
  displayName: name,
  teamId: team,
  level: 1,
  halfLevel: 0,
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  life: {
    maximum: hp,
  },
  resources: [],
  defense: {
    label: 'Defense',
    value: 12,
  },
  skills: [],
  weapons: [],
  actions: [],
  abilities: [],
});

describe('presentationEvents mapping', () => {
  it('maps a successful movement result correctly', () => {
    const fromCell: GridCell = { x: 2, y: 4 };
    const toCell: GridCell = { x: 3, y: 4 };
    
    const mockMovementResult: Extract<CombatSessionMovementResult, { ok: true }> = {
      ok: true,
      from: fromCell,
      destination: toCell,
      distance: 1,
      remainingMovement: 3,
    };

    const event = mapMovementToEvent('player-1', mockMovementResult);
    expect(event).toEqual({
      type: 'combatant_move',
      participantId: 'player-1',
      fromCell,
      toCell,
    });
  });

  it('maps a successful attack hit correctly', () => {
    const mockAttack: CombatSessionResolvedAttack = {
      ok: true,
      attacker: createMockSheet('attacker-1', 'Hero', 'team-player', 10),
      target: createMockSheet('target-1', 'Gladiator', 'team-enemy', 20),
      action: {
        actionId: 'basic_strike',
        label: 'Practice Strike',
        kind: 'main',
        weapon: {
          weaponId: 'training_blade',
          label: 'Training Blade',
          rangeProfile: {
            maximumDistance: 1,
            band: 'melee',
          },
        },
        skillId: 'melee',
        skillDisplayName: 'Melee',
        checkModifier: 5,
        damageBase: 6,
      },
      roll: 12,
      events: [],
      result: {
        outcome: 'hit',
        check: {
          checkId: 'check-1',
          actorId: 'attacker-1',
          roll: 12,
          modifiers: [],
          modifierTotal: 0,
          total: 17,
          target: 12,
          success: true,
          event: {
            type: 'check_resolved',
            checkId: 'check-1',
            actorId: 'attacker-1',
            roll: 12,
            modifiers: [],
            modifierTotal: 0,
            total: 17,
            target: 12,
            success: true,
          },
        },
        damage: {
          applied: true,
          amount: 5,
        },
      },
      outcome: {
        status: 'ongoing',
        activeTeamIds: ['team-player', 'team-enemy'],
      },
    };

    const events = mapAttackToEvents(mockAttack, 'team-player', false);

    expect(events.length).toBe(2);
    expect(events[0]).toEqual({
      type: 'attack_anticipation',
      attackerId: 'attacker-1',
      targetId: 'target-1',
      weaponId: 'training_blade',
    });
    expect(events[1]).toEqual({
      type: 'attack_hit',
      attackerId: 'attacker-1',
      targetId: 'target-1',
      damageAmount: 5,
      isDefeated: false,
    });
  });

  it('maps an attack miss correctly', () => {
    const mockAttack: CombatSessionResolvedAttack = {
      ok: true,
      attacker: createMockSheet('attacker-1', 'Hero', 'team-player', 10),
      target: createMockSheet('target-1', 'Gladiator', 'team-enemy', 20),
      action: {
        actionId: 'basic_strike',
        label: 'Practice Strike',
        kind: 'main',
        weapon: {
          weaponId: 'training_blade',
          label: 'Training Blade',
          rangeProfile: {
            maximumDistance: 1,
            band: 'melee',
          },
        },
        skillId: 'melee',
        skillDisplayName: 'Melee',
        checkModifier: 5,
        damageBase: 6,
      },
      roll: 3,
      events: [],
      result: {
        outcome: 'miss',
        check: {
          checkId: 'check-1',
          actorId: 'attacker-1',
          roll: 3,
          modifiers: [],
          modifierTotal: 0,
          total: 8,
          target: 12,
          success: false,
          event: {
            type: 'check_resolved',
            checkId: 'check-1',
            actorId: 'attacker-1',
            roll: 3,
            modifiers: [],
            modifierTotal: 0,
            total: 8,
            target: 12,
            success: false,
          },
        },
        damage: {
          applied: false,
        },
      },
      outcome: {
        status: 'ongoing',
        activeTeamIds: ['team-player', 'team-enemy'],
      },
    };

    const events = mapAttackToEvents(mockAttack, 'team-player', false);

    expect(events.length).toBe(2);
    expect(events[0]).toEqual({
      type: 'attack_anticipation',
      attackerId: 'attacker-1',
      targetId: 'target-1',
      weaponId: 'training_blade',
    });
    expect(events[1]).toEqual({
      type: 'attack_miss',
      attackerId: 'attacker-1',
      targetId: 'target-1',
    });
  });

  it('maps a fatal hit to hit + defeat + outcome events correctly', () => {
    const mockAttack: CombatSessionResolvedAttack = {
      ok: true,
      attacker: createMockSheet('attacker-1', 'Hero', 'team-player', 10),
      target: createMockSheet('target-1', 'Gladiator', 'team-enemy', 20),
      action: {
        actionId: 'basic_strike',
        label: 'Practice Strike',
        kind: 'main',
        weapon: {
          weaponId: 'training_blade',
          label: 'Training Blade',
          rangeProfile: {
            maximumDistance: 1,
            band: 'melee',
          },
        },
        skillId: 'melee',
        skillDisplayName: 'Melee',
        checkModifier: 5,
        damageBase: 6,
      },
      roll: 18,
      events: [],
      result: {
        outcome: 'hit',
        check: {
          checkId: 'check-1',
          actorId: 'attacker-1',
          roll: 18,
          modifiers: [],
          modifierTotal: 0,
          total: 23,
          target: 12,
          success: true,
          event: {
            type: 'check_resolved',
            checkId: 'check-1',
            actorId: 'attacker-1',
            roll: 18,
            modifiers: [],
            modifierTotal: 0,
            total: 23,
            target: 12,
            success: true,
          },
        },
        damage: {
          applied: true,
          amount: 25,
        },
      },
      outcome: {
        status: 'resolved',
        winningTeamId: 'team-player',
      },
    };

    const events = mapAttackToEvents(mockAttack, 'team-player', true);

    expect(events.length).toBe(4);
    expect(events[0].type).toBe('attack_anticipation');
    expect(events[1]).toEqual({
      type: 'attack_hit',
      attackerId: 'attacker-1',
      targetId: 'target-1',
      damageAmount: 25,
      isDefeated: true,
    });
    expect(events[2]).toEqual({
      type: 'combatant_defeated',
      participantId: 'target-1',
    });
    expect(events[3]).toEqual({
      type: 'combat_outcome',
      status: 'victory',
    });
  });
});
