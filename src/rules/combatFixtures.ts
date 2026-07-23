import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import {
  createTacticalEncounter,
  type CreateEncounterResult,
  type ParticipantLifeInput,
  type TeamId,
  type TurnOrder,
} from './tacticalEncounter';
import {
  buildTacticalParticipant,
  type ParticipantBuildInput,
  type TacticalCatalogs,
  type TacticalParticipant,
} from './tacticalParticipant';

export const COMBAT_FIXTURE_IDS = {
  encounter: 'test_encounter',
  player: 'player_actor',
  opponent: 'test_opponent',
  playerTeam: 'team_player',
  opponentTeam: 'team_opponent',
  offensiveAction: 'basic_strike',
} as const;

export type CombatFixtureParticipantOverrides = {
  id?: string;
  name?: string;
  actionIds?: readonly string[];
};

export type CombatFixtureOverrides = {
  encounterId?: string;
  catalogs?: TacticalCatalogs;
  player?: CombatFixtureParticipantOverrides;
  opponent?: CombatFixtureParticipantOverrides;
  playerTeamId?: TeamId;
  opponentTeamId?: TeamId;
  playerLife?: ParticipantLifeInput;
  opponentLife?: ParticipantLifeInput;
  turnOrder?: TurnOrder;
};

export type MinimalCombatEncounterFixture = {
  encounter: Extract<CreateEncounterResult, { ok: true }>['encounter'];
  events: Extract<CreateEncounterResult, { ok: true }>['events'];
  player: TacticalParticipant;
  opponent: TacticalParticipant;
  ids: {
    encounterId: string;
    playerId: string;
    opponentId: string;
    playerTeamId: TeamId;
    opponentTeamId: TeamId;
    offensiveActionId: string;
  };
};

export function createMinimalCombatEncounterFixture(
  overrides: CombatFixtureOverrides = {},
): MinimalCombatEncounterFixture {
  const catalogs = overrides.catalogs ?? mvpTacticalCatalogs;
  const playerId = overrides.player?.id ?? COMBAT_FIXTURE_IDS.player;
  const opponentId = overrides.opponent?.id ?? COMBAT_FIXTURE_IDS.opponent;
  const playerTeamId = overrides.playerTeamId ?? COMBAT_FIXTURE_IDS.playerTeam;
  const opponentTeamId = overrides.opponentTeamId ?? COMBAT_FIXTURE_IDS.opponentTeam;
  const turnOrder = overrides.turnOrder ?? [playerId, opponentId];

  const player = requireParticipant(
    catalogs,
    createParticipantInput({
      id: playerId,
      name: overrides.player?.name ?? 'Player Actor',
      actionIds: overrides.player?.actionIds,
    }),
  );
  const opponent = requireParticipant(
    catalogs,
    createParticipantInput({
      id: opponentId,
      name: overrides.opponent?.name ?? 'Test Opponent',
      actionIds: overrides.opponent?.actionIds,
    }),
  );

  const result = createTacticalEncounter({
    id: overrides.encounterId ?? COMBAT_FIXTURE_IDS.encounter,
    participants: [player, opponent],
    teamByParticipantId: {
      [playerId]: playerTeamId,
      [opponentId]: opponentTeamId,
    },
    lifeByParticipantId: {
      [playerId]: overrides.playerLife ?? { maximum: 12 },
      [opponentId]: overrides.opponentLife ?? { maximum: 8 },
    },
    turnOrder,
  });

  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return {
    encounter: result.encounter,
    events: result.events,
    player,
    opponent,
    ids: {
      encounterId: result.encounter.id,
      playerId,
      opponentId,
      playerTeamId,
      opponentTeamId,
      offensiveActionId: COMBAT_FIXTURE_IDS.offensiveAction,
    },
  };
}

function createParticipantInput(
  overrides: Pick<ParticipantBuildInput, 'id' | 'name' | 'actionIds'>,
): ParticipantBuildInput {
  return {
    id: overrides.id,
    name: overrides.name,
    ancestryId: 'baseline_origin',
    archetypeId: 'martial_vanguard',
    attributePresetId: 'balanced_start',
    actionIds: overrides.actionIds,
  };
}

function requireParticipant(
  catalogs: TacticalCatalogs,
  input: ParticipantBuildInput,
): TacticalParticipant {
  const result = buildTacticalParticipant(catalogs, input);
  if (!result.ok) {
    throw new Error(result.error.code);
  }

  return result.participant;
}
