import type { EncounterEvent, TacticalEncounter } from './tacticalEncounter';

export type DamageInput = {
  encounter: TacticalEncounter | undefined;
  sourceId: string;
  targetId: string;
  amount: number;
};

export type DamageError =
  | {
      code: 'missing_encounter';
    }
  | {
      code: 'unknown_source';
      sourceId: string;
    }
  | {
      code: 'unknown_target';
      targetId: string;
    }
  | {
      code: 'invalid_damage_amount';
      amount: number;
    };

export type DamageResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      events: readonly EncounterEvent[];
    }
  | {
      ok: false;
      error: DamageError;
    };

export function applyDamage(input: DamageInput): DamageResult {
  const { encounter, sourceId, targetId, amount } = input;
  if (!encounter) {
    return {
      ok: false,
      error: {
        code: 'missing_encounter',
      },
    };
  }

  const source = encounter.participants.find((participant) => participant.id === sourceId);
  if (!source) {
    return {
      ok: false,
      error: {
        code: 'unknown_source',
        sourceId,
      },
    };
  }

  const target = encounter.participants.find((participant) => participant.id === targetId);
  if (!target) {
    return {
      ok: false,
      error: {
        code: 'unknown_target',
        targetId,
      },
    };
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_damage_amount',
        amount,
      },
    };
  }

  const previousLife = target.life.current;
  const currentLife = Math.max(0, previousLife - amount);
  const defeated = target.defeated || currentLife === 0;
  const participants = encounter.participants.map((participant) => {
    if (participant.id !== targetId) {
      return participant;
    }

    return {
      ...participant,
      life: {
        ...participant.life,
        current: currentLife,
      },
      defeated,
    };
  });
  const nextEncounter: TacticalEncounter = {
    ...encounter,
    participants,
  };
  const events: EncounterEvent[] = [
    {
      type: 'damage_applied',
      encounterId: encounter.id,
      sourceId,
      targetId,
      amount,
      previousLife,
      currentLife,
    },
  ];

  if (!target.defeated && defeated) {
    events.push({
      type: 'participant_defeated',
      encounterId: encounter.id,
      participantId: targetId,
      sourceId,
    });
  }

  return {
    ok: true,
    encounter: nextEncounter,
    events,
  };
}

