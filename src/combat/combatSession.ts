import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import { resolveBasicAttackWithDamage } from '../rules/attackDamage';
import { createMinimalCombatEncounterFixture } from '../rules/combatFixtures';
import {
  endTurn,
  getActiveParticipant,
  getEncounterOutcome,
  type EncounterEvent,
  type EncounterOutcome,
  type EndTurnError,
  type TacticalEncounter,
} from '../rules/tacticalEncounter';
import { getCombatCliEnemyScriptDecision } from '../cli/combatCliEnemyScript';
import {
  DEFAULT_COMBAT_CLI_ENCOUNTER_ID,
  getCombatCliEncounterPreset,
  resolveCombatCliEncounterPreset,
  type CombatCliResolvedAbility,
  type CombatCliResolvedAction,
  type CombatCliResolvedEncounterPreset,
  type CombatCliResolvedSheet,
} from '../cli/combatCliPresets';
import {
  createCombatCliResourceState,
  spendCombatCliResource,
  type CombatCliResourceStateByParticipant,
  type CombatCliSpendResourceResult,
} from '../cli/combatCliResources';
import type { GridCell } from '../movement/grid';
import {
  createCombatPositioningState,
  getCombatParticipantCell,
  moveCombatParticipant,
  type CombatMovementRejectionReason,
  type CombatPositioningState,
} from './combatPositioning';
import { CombatWeaponRangeBand } from './combatWeaponRange';
import { validateCombatSessionAttackRange } from './combatAttackRange';

export const COMBAT_SESSION_MOVEMENT_RANGE = 4;

const COMBAT_SESSION_DEBUG_GRID_BOUNDS = { width: 10, height: 8 } as const;
const COMBAT_SESSION_DEBUG_STARTING_CELLS = [
  { x: 2, y: 4 },
  { x: 6, y: 4 },
] as const;

export type CombatSessionRoller = {
  rollD20: () => number;
};

export type CombatSession = {
  preset: CombatCliResolvedEncounterPreset;
  encounter: TacticalEncounter;
  resources: CombatCliResourceStateByParticipant;
  positioning: CombatPositioningState;
  movementAllowance: CombatSessionMovementAllowance;
  roller?: CombatSessionRoller;
};

export type CombatSessionMovementAllowance = {
  participantId: string;
  maximum: number;
  remaining: number;
};

export type CombatSessionMovementError =
  | {
      code: 'encounter_not_ongoing';
      outcome: EncounterOutcome;
    }
  | {
      code: 'no_active_participant';
    }
  | {
      code: 'inactive_participant';
      participantId: string;
      activeParticipantId: string;
    }
  | {
      code: CombatMovementRejectionReason;
      participantId: string;
      destination: GridCell;
    }
  | {
      code: 'movement_allowance_exceeded';
      participantId: string;
      destination: GridCell;
      distance: number;
      remainingMovement: number;
    };

export type CombatSessionMovementResult =
  | {
      ok: true;
      from: GridCell;
      destination: GridCell;
      distance: number;
      remainingMovement: number;
    }
  | {
      ok: false;
      error: CombatSessionMovementError;
    };

export type CombatSessionAttackEvent =
  | Exclude<
      ReturnType<typeof resolveBasicAttackWithDamage>,
      { ok: false }
    >['events'][number]
  | EncounterEvent;

export type CombatSessionActionContext = {
  attacker: CombatCliResolvedSheet;
  target: CombatCliResolvedSheet;
};

export type CombatSessionResolvedAttack = {
  ok: true;
  attacker: CombatCliResolvedSheet;
  target: CombatCliResolvedSheet;
  action: CombatCliResolvedAction;
  ability?: CombatCliResolvedAbility;
  roll: number;
  events: readonly CombatSessionAttackEvent[];
  result: Exclude<ReturnType<typeof resolveBasicAttackWithDamage>, { ok: false }>['result'];
  outcome: EncounterOutcome;
};

export type CombatSessionAttackError =
  | {
      code: 'encounter_not_ongoing';
      outcome: EncounterOutcome;
    }
  | {
      code: 'no_active_participant';
    }
  | {
      code: 'missing_automatic_roll';
    }
  | {
      code: 'attack_failed';
      error: Exclude<ReturnType<typeof resolveBasicAttackWithDamage>, { ok: true }>['error'];
    }
  | {
      code: 'attack_out_of_range';
      attackerId: string;
      targetId: string;
      distance: number;
      maximumDistance: number;
      weaponId: string;
      rangeBand: CombatWeaponRangeBand;
    }
  | {
      code: 'missing_combat_position';
      participantId: string;
    }
  | {
      code: 'action_unavailable';
      actionId: string;
      participantId: string;
    };

export type CombatSessionAttackResult =
  | CombatSessionResolvedAttack
  | {
      ok: false;
      error: CombatSessionAttackError;
    };

export type CombatSessionAbilityError =
  | CombatSessionAttackError
  | {
      code: 'no_primary_ability';
      participantId: string;
    }
  | {
      code: 'main_action_unavailable';
      participantId: string;
    }
  | {
      code: 'resource_spend_failed';
      error: Exclude<CombatCliSpendResourceResult, { ok: true }>['error'];
      ability: CombatCliResolvedAbility;
    };

export type CombatSessionAbilityResult =
  | (CombatSessionResolvedAttack & {
      ability: CombatCliResolvedAbility;
      spentResource: Exclude<CombatCliSpendResourceResult, { ok: false }>['resource'];
    })
  | {
      ok: false;
      error: CombatSessionAbilityError;
    };

export type CombatSessionEndTurnResult =
  | {
      ok: true;
      events: readonly EncounterEvent[];
      outcome: EncounterOutcome;
    }
  | {
      ok: false;
      error: EndTurnError;
    };

export type CombatSessionOpponentActionResult =
  | {
      ok: true;
      attack: CombatSessionResolvedAttack;
      endTurn?: Extract<CombatSessionEndTurnResult, { ok: true }>;
      outcome: EncounterOutcome;
    }
  | {
      ok: false;
      error:
        | {
            code: 'no_opponent_configured';
          }
        | {
            code: 'opponent_script_unavailable';
            reason: Exclude<
              ReturnType<typeof getCombatCliEnemyScriptDecision>,
              { ok: true }
            >['reason'];
          }
        | CombatSessionAttackError
        | {
            code: 'end_turn_failed';
            error: Exclude<CombatSessionEndTurnResult, { ok: true }>['error'];
          };
    };

export type CombatSessionAvailableActions = {
  sheet: CombatCliResolvedSheet;
  actions: readonly CombatCliResolvedAction[];
  abilities: readonly CombatCliResolvedAbility[];
};

export function createCombatSessionFromPresetId(
  encounterId = DEFAULT_COMBAT_CLI_ENCOUNTER_ID,
  options: {
    roller?: CombatSessionRoller;
  } = {},
): CombatSession {
  const encounterPreset = getCombatCliEncounterPreset(encounterId);
  if (!encounterPreset) {
    throw new Error(`Unknown combat encounter preset: ${encounterId}`);
  }

  const preset = resolveCombatCliEncounterPreset(encounterPreset);
  const [player, opponent] = preset.sheets;
  if (!player || !opponent) {
    throw new Error('Combat session requires two resolved sheets.');
  }

  const fixture = createMinimalCombatEncounterFixture({
    player: {
      name: player.displayName,
      actionIds: player.actions.map(action => action.actionId),
    },
    opponent: {
      name: opponent.displayName,
      actionIds: opponent.actions.map(action => action.actionId),
    },
    playerLife: {
      maximum: player.life.maximum,
    },
    opponentLife: {
      maximum: opponent.life.maximum,
    },
    turnOrder: [player.participantId, opponent.participantId],
  });

  const encounter = fixture.encounter;

  return {
    preset,
    encounter,
    resources: createCombatCliResourceState(preset.sheets),
    positioning: createCombatPositioningState({
      bounds: COMBAT_SESSION_DEBUG_GRID_BOUNDS,
      placements: [
        {
          participantId: player.participantId,
          cell: COMBAT_SESSION_DEBUG_STARTING_CELLS[0],
        },
        {
          participantId: opponent.participantId,
          cell: COMBAT_SESSION_DEBUG_STARTING_CELLS[1],
        },
      ],
    }),
    movementAllowance: createCombatSessionMovementAllowance(
      encounter.activeTurn.participantId,
    ),
    roller: options.roller,
  };
}

export function restartCombatSession(
  session: CombatSession,
  encounterId = session.preset.id,
): void {
  const nextSession = createCombatSessionFromPresetId(encounterId, {
    roller: session.roller,
  });
  session.preset = nextSession.preset;
  session.encounter = nextSession.encounter;
  session.resources = nextSession.resources;
  session.positioning = nextSession.positioning;
  session.movementAllowance = nextSession.movementAllowance;
}

export function getCombatSessionOutcome(session: CombatSession): EncounterOutcome {
  return getEncounterOutcome(session.encounter);
}

export function getCombatSessionActiveParticipant(session: CombatSession) {
  return getActiveParticipant(session.encounter);
}

export function getCombatSessionParticipantCell(
  session: CombatSession,
  participantId: string,
): GridCell | undefined {
  return getCombatParticipantCell(session.positioning, participantId);
}

export function getCombatSessionPositioning(
  session: CombatSession,
): CombatPositioningState {
  return createCombatPositioningState({
    bounds: session.positioning.bounds,
    placements: Object.entries(session.positioning.positions).map(
      ([participantId, cell]) => ({ participantId, cell }),
    ),
    blockedCells: session.positioning.blockedCells,
  });
}

export function getCombatSessionMovementAllowance(
  session: CombatSession,
): CombatSessionMovementAllowance {
  return { ...session.movementAllowance };
}

export function getCombatSessionRemainingMovement(session: CombatSession): number {
  return session.movementAllowance.remaining;
}

export function moveCombatSessionActiveParticipant(
  session: CombatSession,
  input: {
    participantId: string;
    destination: GridCell;
  },
): CombatSessionMovementResult {
  const outcome = getCombatSessionOutcome(session);
  if (outcome.status !== 'ongoing') {
    return {
      ok: false,
      error: {
        code: 'encounter_not_ongoing',
        outcome,
      },
    };
  }

  const active = getCombatSessionActiveParticipant(session);
  if (!active) {
    return {
      ok: false,
      error: {
        code: 'no_active_participant',
      },
    };
  }

  if (active.id !== input.participantId) {
    return {
      ok: false,
      error: {
        code: 'inactive_participant',
        participantId: input.participantId,
        activeParticipantId: active.id,
      },
    };
  }

  const movement = moveCombatParticipant(session.positioning, {
    ...input,
    range: COMBAT_SESSION_MOVEMENT_RANGE,
  });
  if (!movement.ok) {
    return {
      ok: false,
      error: {
        code: movement.reason,
        participantId: movement.participantId,
        destination: movement.destination,
      },
    };
  }


  if (movement.distance > session.movementAllowance.remaining) {
    return {
      ok: false,
      error: {
        code: 'movement_allowance_exceeded',
        participantId: input.participantId,
        destination: { ...input.destination },
        distance: movement.distance,
        remainingMovement: session.movementAllowance.remaining,
      },
    };
  }

  session.positioning = movement.state;
  session.movementAllowance = {
    ...session.movementAllowance,
    remaining: session.movementAllowance.remaining - movement.distance,
  };

  return {
    ok: true,
    from: movement.from,
    destination: movement.destination,
    distance: movement.distance,
    remainingMovement: session.movementAllowance.remaining,
  };
}

export function getCombatSessionActiveSheet(
  session: CombatSession,
): CombatCliResolvedSheet | undefined {
  const active = getCombatSessionActiveParticipant(session);

  return active ? getCombatSessionSheet(session, active.id) : undefined;
}

export function getCombatSessionAvailableActions(
  session: CombatSession,
): CombatSessionAvailableActions | undefined {
  const sheet = getCombatSessionActiveSheet(session);
  if (!sheet) {
    return undefined;
  }

  return {
    sheet,
    actions: sheet.actions,
    abilities: sheet.abilities,
  };
}

export function getCombatSessionSheet(
  session: CombatSession,
  participantId: string,
): CombatCliResolvedSheet {
  const sheet = session.preset.sheets.find(
    (entry) => entry.participantId === participantId,
  );
  if (!sheet) {
    throw new Error(`Missing combat resolved sheet for participant ${participantId}`);
  }

  return sheet;
}

export function getCombatSessionLife(
  session: CombatSession,
  participantId: string,
) {
  return session.encounter.participants.find((entry) => entry.id === participantId)?.life;
}

export function resolveCombatSessionAction(
  session: CombatSession,
  actionId: string,
  input: {
    roll?: number;
    roller?: CombatSessionRoller;
  } = {},
): CombatSessionAttackResult {
  const context = getCombatSessionActionContext(session);
  if (!context.ok) {
    return context;
  }

  const action = context.attacker.actions.find((entry) => entry.actionId === actionId);
  if (!action) {
    return {
      ok: false,
      error: {
        code: 'action_unavailable',
        actionId,
        participantId: context.attacker.participantId,
      },
    };
  }

  return resolveCombatSessionAttackWithAction(session, {
    ...context,
    action,
    roll: input.roll,
    roller: input.roller,
  });
}

export function resolveCombatSessionBasicAttack(
  session: CombatSession,
  input: {
    roll?: number;
    roller?: CombatSessionRoller;
  } = {},
): CombatSessionAttackResult {
  const context = getCombatSessionActionContext(session);
  if (!context.ok) {
    return context;
  }

  const action = getPrimaryCombatSessionAction(context.attacker);
  return resolveCombatSessionAction(session, action.actionId, input);
}

export function resolveCombatSessionPrimaryAbility(
  session: CombatSession,
  input: {
    roll?: number;
    roller?: CombatSessionRoller;
  } = {},
): CombatSessionAbilityResult {
  const context = getCombatSessionActionContext(session);
  if (!context.ok) {
    return context;
  }

  const ability = getPrimaryCombatSessionAbility(context.attacker);
  if (!ability) {
    return {
      ok: false,
      error: {
        code: 'no_primary_ability',
        participantId: context.attacker.participantId,
      },
    };
  }

  if (!session.encounter.activeTurn.mainActionAvailable) {
    return {
      ok: false,
      error: {
        code: 'main_action_unavailable',
        participantId: context.attacker.participantId,
      },
    };
  }

  const spend = spendCombatCliResource(
    session.resources,
    context.attacker.participantId,
    ability.cost.resourceId,
    ability.cost.amount,
  );
  if (!spend.ok) {
    return {
      ok: false,
      error: {
        code: 'resource_spend_failed',
        error: spend.error,
        ability,
      },
    };
  }

  const attack = resolveCombatSessionAttackWithAction(session, {
    ...context,
    action: ability.action,
    ability,
    roll: input.roll,
    roller: input.roller,
  });
  if (!attack.ok) {
    return attack;
  }

  session.resources = spend.resources;

  return {
    ...attack,
    ability,
    spentResource: spend.resource,
  };
}

export function advanceCombatSessionTurn(
  session: CombatSession,
): CombatSessionEndTurnResult {
  const result = endTurn(session.encounter);
  if (!result.ok) {
    return result;
  }

  session.encounter = result.encounter;
  session.movementAllowance = createCombatSessionMovementAllowance(
    result.encounter.activeTurn.participantId,
  );

  return {
    ok: true,
    events: result.events,
    outcome: getCombatSessionOutcome(session),
  };
}

function createCombatSessionMovementAllowance(
  participantId: string,
): CombatSessionMovementAllowance {
  return {
    participantId,
    maximum: COMBAT_SESSION_MOVEMENT_RANGE,
    remaining: COMBAT_SESSION_MOVEMENT_RANGE,
  };
}

export function runCombatSessionOpponentAction(
  session: CombatSession,
  input: {
    roll?: number;
    roller?: CombatSessionRoller;
  } = {},
): CombatSessionOpponentActionResult {
  const opponent = session.preset.sheets[1];
  if (!opponent) {
    return {
      ok: false,
      error: {
        code: 'no_opponent_configured',
      },
    };
  }

  const decision = getCombatCliEnemyScriptDecision(
    session.encounter,
    opponent.participantId,
  );
  if (!decision.ok) {
    return {
      ok: false,
      error: {
        code: 'opponent_script_unavailable',
        reason: decision.reason,
      },
    };
  }

  const attack = resolveCombatSessionAttackWithAction(session, {
    attacker: opponent,
    target: getCombatSessionTargetSheet(session, opponent),
    action: getPrimaryCombatSessionAction(opponent),
    roll: input.roll,
    roller: input.roller,
  });
  if (!attack.ok) {
    return attack;
  }

  if (getCombatSessionOutcome(session).status !== 'ongoing') {
    return {
      ok: true,
      attack,
      outcome: getCombatSessionOutcome(session),
    };
  }

  const ended = advanceCombatSessionTurn(session);
  if (!ended.ok) {
    return {
      ok: false,
      error: {
        code: 'end_turn_failed',
        error: ended.error,
      },
    };
  }

  return {
    ok: true,
    attack,
    endTurn: ended,
    outcome: getCombatSessionOutcome(session),
  };
}

export function getPrimaryCombatSessionAbility(
  sheet: CombatCliResolvedSheet,
): CombatCliResolvedAbility | undefined {
  return sheet.abilities[0];
}

export function getPrimaryCombatSessionAction(
  sheet: CombatCliResolvedSheet,
): CombatCliResolvedAction {
  const action = sheet.actions.find((entry) => entry.kind === 'main');
  if (!action) {
    throw new Error(`Missing combat main action for participant ${sheet.participantId}`);
  }

  return action;
}

export function getCombatSessionTargetSheet(
  session: CombatSession,
  attacker: CombatCliResolvedSheet,
): CombatCliResolvedSheet {
  const target = session.preset.sheets.find(
    (entry) => entry.teamId !== attacker.teamId,
  );
  if (!target) {
    throw new Error(`Missing combat target sheet for participant ${attacker.participantId}`);
  }

  return target;
}

function getCombatSessionActionContext(
  session: CombatSession,
):
  | ({
      ok: true;
    } & CombatSessionActionContext)
  | {
      ok: false;
      error: Extract<
        CombatSessionAttackError,
        { code: 'encounter_not_ongoing' | 'no_active_participant' }
      >;
    } {
  const outcome = getCombatSessionOutcome(session);
  if (outcome.status !== 'ongoing') {
    return {
      ok: false,
      error: {
        code: 'encounter_not_ongoing',
        outcome,
      },
    };
  }

  const active = getCombatSessionActiveParticipant(session);
  if (!active) {
    return {
      ok: false,
      error: {
        code: 'no_active_participant',
      },
    };
  }

  const attacker = getCombatSessionSheet(session, active.id);

  return {
    ok: true,
    attacker,
    target: getCombatSessionTargetSheet(session, attacker),
  };
}

function resolveCombatSessionAttackWithAction(
  session: CombatSession,
  input: CombatSessionActionContext & {
    action: CombatCliResolvedAction;
    ability?: CombatCliResolvedAbility;
    roll?: number;
    roller?: CombatSessionRoller;
  },
): CombatSessionAttackResult {
  const rangeValidation = validateCombatSessionAttackRange(session, {
    attackerId: input.attacker.participantId,
    targetId: input.target.participantId,
    weapon: input.action.weapon,
  });

  if (!rangeValidation.ok) {
    return {
      ok: false,
      error: rangeValidation.error,
    };
  }

  const roll = input.roll ?? input.roller?.rollD20() ?? session.roller?.rollD20();
  if (roll === undefined) {
    return {
      ok: false,
      error: {
        code: 'missing_automatic_roll',
      },
    };
  }

  const result = resolveBasicAttackWithDamage({
    encounter: session.encounter,
    attackerId: input.attacker.participantId,
    targetId: input.target.participantId,
    actionId: input.action.actionId,
    roll,
    defense: input.target.defense.value,
    modifiers: [
      {
        sourceId: 'session_resolved_attack_modifier',
        value: input.action.checkModifier,
      },
    ],
    damageAmount: input.action.damageBase,
    actionDefinitions: mvpTacticalCatalogs.actions,
  });

  if (!result.ok) {
    return {
      ok: false,
      error: {
        code: 'attack_failed',
        error: result.error,
      },
    };
  }

  session.encounter = result.encounter;

  return {
    ok: true,
    attacker: input.attacker,
    target: input.target,
    action: input.action,
    ability: input.ability,
    roll,
    events: result.events,
    result: result.result,
    outcome: getCombatSessionOutcome(session),
  };
}
