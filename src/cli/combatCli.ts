import { createInterface } from 'node:readline/promises';
import { type EncounterOutcome } from '../rules/tacticalEncounter';
import {
  advanceCombatSessionTurn,
  createCombatSessionFromPresetId,
  getCombatSessionActiveParticipant,
  getCombatSessionActiveSheet,
  getCombatSessionOutcome,
  getCombatSessionSheet,
  getPrimaryCombatSessionAction,
  restartCombatSession,
  resolveCombatSessionBasicAttack,
  resolveCombatSessionPrimaryAbility,
  runCombatSessionOpponentAction,
  type CombatSession,
  type CombatSessionAbilityError,
  type CombatSessionAttackError,
  type CombatSessionOpponentActionResult,
  type CombatSessionResolvedAttack,
} from '../combat/combatSession';
import {
  COMBAT_ENCOUNTER_PRESETS,
  DEFAULT_COMBAT_ENCOUNTER_ID,
  getCombatEncounterPreset,
  type CombatResolvedAbility,
  type CombatResolvedSheet,
} from '../content/combatPresets';
import { formatCombatCliActionMenu } from './combatCliActions';
import { createCombatCliDice } from './combatCliDice';
import { getEnemyScriptDecision } from '../combat/enemyScript';
import { formatCombatCliEvent, type CombatCliLogEvent } from './combatCliLog';
import { formatCombatCliEndSummary, formatCombatCliOutcome } from './combatCliOutcome';
import { parseCombatCliExplicitD20Roll } from './combatCliRollInput';
import {
  getCombatResource,
  type CombatSpendResourceResult,
} from '../combat/combatResources';

type CombatCliSession = CombatSession & {
  running: boolean;
};

const COMMANDS = [
  'help',
  'status',
  'actions',
  'encounters',
  'attack',
  'ability',
  'done',
  'enemy',
  'restart',
  'reset',
  'end',
  'quit',
] as const;

export async function runCombatCli(): Promise<void> {
  const session = createCombatCliSession();
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  writeLine('Combat CLI Harness v0');
  writeLine('Preset 1v1 playtest. Type "help" for commands.');
  writeLine('');
  printStatus(session);

  try {
    while (session.running) {
      const input = (await terminal.question('combat> ')).trim().toLowerCase();
      handleCommand(session, input);
    }
  } finally {
    terminal.close();
  }
}

function createCombatCliSession(
  encounterId = DEFAULT_COMBAT_ENCOUNTER_ID,
): CombatCliSession {
  return {
    ...createCombatSessionFromPresetId(encounterId, {
      roller: createCombatCliDice(),
    }),
    running: true,
  };
}

function handleCommand(session: CombatCliSession, input: string): void {
  const [command = '', argument] = input.split(/\s+/);

  switch (command) {
    case '':
      return;
    case 'help':
      printHelp();
      return;
    case 'status':
      printStatus(session);
      return;
    case 'actions':
    case 'act':
      printActions(session);
      return;
    case 'encounters':
    case 'presets':
      printEncounters(session);
      return;
    case 'attack':
      handleAttack(session, argument);
      return;
    case 'ability':
    case 'power':
      handleAbility(session, argument);
      return;
    case 'enemy':
    case 'auto':
      handleEnemy(session);
      return;
    case 'done':
      handleDone(session);
      return;
    case 'restart':
    case 'reset':
      handleRestart(session, argument);
      return;
    case 'end':
      handleEndTurn(session);
      return;
    case 'quit':
    case 'q':
      session.running = false;
      writeLine('Exiting combat harness.');
      return;
    default:
      writeLine(`Unknown command "${input}". Type "help" for: ${COMMANDS.join(', ')}.`);
  }
}

function handleRestart(session: CombatCliSession, encounterId?: string): void {
  const nextEncounterId = encounterId ?? session.preset.id;
  const encounterPreset = getCombatEncounterPreset(nextEncounterId);
  if (!encounterPreset) {
    writeLine(`Unknown encounter preset "${nextEncounterId}". Type "encounters" to list options.`);
    return;
  }

  restartCombatSession(session, encounterPreset.id);
  session.running = true;

  writeLine(`Combat restarted: ${session.preset.label}.`);
  printStatus(session);
}

function handleAttack(session: CombatCliSession, rollInput?: string): void {
  const explicitRoll = parseOptionalRollOrReport(rollInput);
  if (rollInput !== undefined && explicitRoll === undefined) {
    return;
  }

  const resolved = resolveCombatSessionBasicAttack(session, {
    roll: explicitRoll,
  });
  printAttackResult(session, resolved);
}

function handleAbility(session: CombatCliSession, rollInput?: string): void {
  const explicitRoll = parseOptionalRollOrReport(rollInput);
  if (rollInput !== undefined && explicitRoll === undefined) {
    return;
  }

  const resolved = resolveCombatSessionPrimaryAbility(session, {
    roll: explicitRoll,
  });
  if (!resolved.ok) {
    printAbilityError(session, resolved.error);
    return;
  }

  printResolvedAttack(session, resolved);
  writeLine(
    `${resolved.ability.cost.resourceLabel} spent: ${resolved.spentResource.current}/${resolved.spentResource.maximum}.`,
  );
}

function handleDone(session: CombatCliSession): void {
  const result = advanceCombatSessionTurn(session);
  if (!result.ok) {
    writeLine(`Could not end turn: ${result.error.code}`);
    return;
  }

  printEvents(session, result.events);

  if (getCombatSessionOutcome(session).status !== 'ongoing') {
    printStatus(session);
    return;
  }

  const [, opponent] = session.preset.sheets;
  const active = getCombatSessionActiveParticipant(session);
  if (opponent && active?.id === opponent.participantId) {
    handleEnemy(session);
    return;
  }

  printStatus(session);
}

function handleEnemy(session: CombatCliSession): void {
  const [, opponent] = session.preset.sheets;
  if (!opponent) {
    writeLine('No CLI opponent configured.');
    return;
  }

  const decision = getEnemyScriptDecision(
    session.encounter,
    opponent.participantId,
  );
  if (!decision.ok) {
    writeLine(formatEnemyScriptDecision(decision.reason));
    return;
  }

  const result = runCombatSessionOpponentAction(session);
  if (!result.ok) {
    printOpponentActionError(session, result.error);
    return;
  }

  writeLine(`${result.attack.attacker.displayName} follows its simple script.`);
  printResolvedAttack(session, result.attack);

  if (!result.endTurn) {
    return;
  }

  printEvents(session, result.endTurn.events);
  printStatus(session);
}

function parseOptionalRollOrReport(rollInput: string | undefined): number | undefined {
  const result = parseCombatCliExplicitD20Roll(rollInput);
  if (!result.ok) {
    writeLine(`Invalid roll "${result.error.value}". Use an integer from 1 to 20.`);
    return undefined;
  }

  return result.roll;
}

function printAttackResult(
  session: CombatCliSession,
  result: ReturnType<typeof resolveCombatSessionBasicAttack>,
): void {
  if (!result.ok) {
    printAttackError(session, result.error);
    return;
  }

  printResolvedAttack(session, result);
}

function printResolvedAttack(
  session: CombatCliSession,
  result: CombatSessionResolvedAttack,
): void {
  const costText = result.ability
    ? ` (${result.ability.cost.amount} ${result.ability.cost.resourceLabel}, spent before the attack resolves)`
    : '';
  writeLine(
    `${result.attacker.displayName} uses ${result.action.label}${costText} against ${result.target.displayName}.`,
  );
  writeLine(
    `Roll ${result.roll} + ${result.action.checkModifier} (${result.action.skillDisplayName}) vs ${result.target.defense.label.toLowerCase()} ${result.target.defense.value}.`,
  );
  writeLine(result.result.outcome === 'hit' ? 'Hit.' : 'Miss.');

  printEvents(session, result.events);
  writeLine(`Outcome: ${formatOutcome(session, result.outcome)}`);
}

function printAttackError(
  session: CombatCliSession,
  error: CombatSessionAttackError,
): void {
  switch (error.code) {
    case 'encounter_not_ongoing':
      writeLine(`Encounter is already ${formatOutcome(session, error.outcome)}.`);
      return;
    case 'no_active_participant':
      writeLine('No active participant found.');
      return;
    case 'missing_automatic_roll':
      writeLine('Attack failed: missing_automatic_roll');
      return;
    case 'attack_failed':
      writeLine(`Attack failed: ${error.error.code}`);
      return;
  }
}

function printAbilityError(
  session: CombatCliSession,
  error: CombatSessionAbilityError,
): void {
  switch (error.code) {
    case 'no_primary_ability':
      writeLine(`${getCombatSessionSheet(session, error.participantId).displayName} has no CLI ability available.`);
      return;
    case 'main_action_unavailable':
      writeLine(`${getCombatSessionSheet(session, error.participantId).displayName} has already spent their main action.`);
      return;
    case 'resource_spend_failed':
      writeLine(formatSpendError(error.error, error.ability));
      return;
    default:
      printAttackError(session, error);
  }
}

function printOpponentActionError(
  session: CombatCliSession,
  error: Exclude<CombatSessionOpponentActionResult, { ok: true }>['error'],
): void {
  switch (error.code) {
    case 'no_opponent_configured':
      writeLine('No CLI opponent configured.');
      return;
    case 'opponent_script_unavailable':
      writeLine(formatEnemyScriptDecision(error.reason));
      return;
    case 'end_turn_failed':
      writeLine(`Could not end enemy turn: ${error.error.code}`);
      return;
    case 'encounter_not_ongoing':
    case 'no_active_participant':
    case 'missing_automatic_roll':
    case 'attack_failed':
      writeLine(`Enemy script failed: ${error.code}`);
      return;
  }
}

function handleEndTurn(session: CombatCliSession): void {
  const result = advanceCombatSessionTurn(session);
  if (!result.ok) {
    writeLine(`Could not end turn: ${result.error.code}`);
    return;
  }

  printEvents(session, result.events);
  printStatus(session);
}

function printHelp(): void {
  writeLine('Commands:');
  writeLine('  help   Show commands.');
  writeLine('  status Show turn, life, resources, resolved sheet essentials, and outcome.');
  writeLine('  actions Show available actions, costs, modifiers, and roll examples.');
  writeLine('  act     Alias for actions.');
  writeLine('  encounters List available encounter presets.');
  writeLine('  presets Alias for encounters.');
  writeLine('  attack [roll]  Roll a d20, or use an explicit 1-20 roll, for a basic attack.');
  writeLine('  ability [roll] Spend PM and resolve the ability with auto or explicit roll.');
  writeLine('  power   Alias for ability.');
  writeLine('  done    End your turn, then auto-run the opponent if it becomes active.');
  writeLine('  restart [id] Reset the current combat, or start an encounter preset by id.');
  writeLine('  reset   Alias for restart.');
  writeLine('  enemy   Run the fixed opponent basic attack if it is their turn.');
  writeLine('  auto    Alias for enemy.');
  writeLine('  end     End the active turn only.');
  writeLine('  quit   Exit the harness.');
}

function printEncounters(session: CombatCliSession): void {
  writeLine('Encounter presets:');
  for (const preset of COMBAT_ENCOUNTER_PRESETS) {
    const marker = preset.id === session.preset.id ? '*' : ' ';
    writeLine(`${marker} ${preset.id} - ${preset.label}: ${preset.description}`);
  }
}

function printActions(session: CombatCliSession): void {
  const outcome = getCombatSessionOutcome(session);
  if (outcome.status !== 'ongoing') {
    writeLine(`Encounter is already ${formatOutcome(session, outcome)}.`);
    return;
  }

  const sheet = getCombatSessionActiveSheet(session);
  if (!sheet) {
    writeLine('No active participant found.');
    return;
  }

  for (const line of formatCombatCliActionMenu({ sheet, resources: session.resources })) {
    writeLine(line);
  }
}

function printStatus(session: CombatCliSession): void {
  const { encounter } = session;
  const active = getCombatSessionActiveParticipant(session);
  writeLine(`Encounter: ${session.preset.label} (${session.preset.id})`);
  writeLine(`Round ${encounter.activeTurn.roundNumber}, turn ${encounter.activeTurn.turnNumber}`);
  writeLine(`Active: ${active ? formatParticipant(session, active.id) : 'none'}`);
  writeLine(
    `Main action: ${encounter.activeTurn.mainActionAvailable ? 'available' : 'spent'}`,
  );

  for (const sheet of session.preset.sheets) {
    const participant = encounter.participants.find(
      (entry) => entry.id === sheet.participantId,
    );
    if (!participant) {
      continue;
    }

    const action = getPrimaryCombatSessionAction(sheet);
    writeLine(
      `${sheet.displayName}: ${participant.life.current}/${participant.life.maximum} life, ${formatResources(session, sheet)}, defeated: ${
        participant.defeated ? 'yes' : 'no'
      }`,
    );
    writeLine(
      `  Level ${sheet.level} | Attributes ${formatAttributes(sheet.attributes)}`,
    );
    writeLine(
      `  ${formatPrimarySkill(sheet)} | ${sheet.defense.label} ${sheet.defense.value} | ${action.label} ${formatSigned(action.checkModifier)}, damage base ${action.damageBase}`,
    );
    for (const ability of sheet.abilities) {
      writeLine(
        `  Ability: ${ability.label} costs ${ability.cost.amount} ${ability.cost.resourceLabel}, ${ability.action.skillDisplayName} ${formatSigned(ability.action.checkModifier)}, damage base ${ability.action.damageBase}`,
      );
    }
  }

  writeLine(`Outcome: ${formatOutcome(session, getCombatSessionOutcome(session))}`);
}

function printEvents(session: CombatCliSession, events: readonly CombatCliLogEvent[]): void {
  for (const event of events) {
    const line = formatCombatCliEvent(event, (participantId) =>
      formatParticipant(session, participantId),
    );
    if (line) {
      writeLine(line);
    }
  }
}

function getSheetByParticipantId(
  session: CombatCliSession,
  participantId: string,
): CombatResolvedSheet {
  return getCombatSessionSheet(session, participantId);
}

function formatEnemyScriptDecision(
  reason: Extract<
    ReturnType<typeof getEnemyScriptDecision>,
    { ok: false }
  >['reason'],
): string {
  switch (reason) {
    case 'encounter_not_ongoing':
      return 'Enemy script cannot run because the encounter is not ongoing.';
    case 'no_active_participant':
      return 'Enemy script cannot run because there is no active participant.';
    case 'active_participant_is_not_enemy':
      return 'Enemy script can only run on the opponent turn.';
    case 'enemy_defeated':
      return 'Enemy script cannot run because the opponent is defeated.';
  }
}

function formatSpendError(
  error: Exclude<CombatSpendResourceResult, { ok: true }>['error'],
  ability: CombatResolvedAbility,
): string {
  switch (error.code) {
    case 'insufficient_resource':
      return `${ability.label} needs ${error.cost} ${ability.cost.resourceLabel}, but only ${error.current} remains. No PM was spent.`;
    case 'unknown_resource':
      return `${ability.label} cannot find resource ${error.resourceId}. No PM was spent.`;
    case 'invalid_resource_cost':
      return `${ability.label} has invalid resource cost ${error.cost}. No PM was spent.`;
  }
}

function formatResources(
  session: CombatCliSession,
  sheet: CombatResolvedSheet,
): string {
  const formattedResources = sheet.resources.map((resource) => {
    const currentResource = getCombatResource(
      session.resources,
      sheet.participantId,
      resource.id,
    );

    return `${resource.label} ${currentResource?.current ?? resource.current}/${resource.maximum}`;
  });

  return formattedResources.length > 0 ? formattedResources.join(', ') : 'no resources';
}

function formatParticipant(session: CombatCliSession, participantId: string): string {
  return getSheetByParticipantId(session, participantId).displayName;
}

function formatAttributes(attributes: CombatResolvedSheet['attributes']): string {
  return `STR ${attributes.strength}, DEX ${attributes.dexterity}, CON ${attributes.constitution}, INT ${attributes.intelligence}, WIS ${attributes.wisdom}, CHA ${attributes.charisma}`;
}

function formatPrimarySkill(sheet: CombatResolvedSheet): string {
  const action = getPrimaryCombatSessionAction(sheet);
  const skill = sheet.skills.find((entry) => entry.skillId === action.skillId);
  if (!skill) {
    return `${action.skillDisplayName} ${formatSigned(action.checkModifier)}`;
  }

  return `${skill.displayName} ${formatSigned(skill.totalModifier)} (${formatSigned(skill.attributeModifier)} attribute, +${skill.halfLevel} half level, +${skill.trainingBonus} trained)`;
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function formatOutcome(session: CombatCliSession, outcome: EncounterOutcome): string {
  return formatCombatCliOutcome(outcome, session.preset.sheets);
}

function printEndSummary(session: CombatCliSession, outcome: EncounterOutcome): void {
  const summary = formatCombatCliEndSummary(outcome, session.preset.sheets);
  if (summary) {
    writeLine(summary);
  }
}

void printEndSummary;

function writeLine(message: string): void {
  console.log(message);
}

void runCombatCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Combat CLI failed: ${message}`);
  process.exitCode = 1;
});