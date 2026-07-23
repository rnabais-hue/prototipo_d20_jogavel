import type { CombatCliResolvedSheet } from './combatCliPresets';
import { getCombatCliResource, type CombatCliResourceStateByParticipant } from './combatCliResources';

export type CombatCliActionMenuInput = {
  sheet: CombatCliResolvedSheet;
  resources?: CombatCliResourceStateByParticipant;
};

export function formatCombatCliActionMenu(input: CombatCliActionMenuInput): readonly string[] {
  const { sheet, resources } = input;
  const lines: string[] = [`Actions for ${sheet.displayName}:`];

  for (const action of sheet.actions) {
    lines.push(
      `  attack [roll] - ${action.label}: ${action.skillDisplayName} ${formatSigned(action.checkModifier)}, damage base ${action.damageBase}. Example: attack 15`,
    );
  }

  if (sheet.abilities.length === 0) {
    lines.push('  ability [roll] - no ability available for this actor.');
  } else {
    for (const ability of sheet.abilities) {
      const resourceText = formatResourceText(sheet, ability.cost.resourceId, resources);
      lines.push(
        `  ability [roll] - ${ability.label}: costs ${ability.cost.amount} ${ability.cost.resourceLabel}${resourceText}, ${ability.action.skillDisplayName} ${formatSigned(ability.action.checkModifier)}, damage base ${ability.action.damageBase}. Example: ability 15`,
      );
    }
  }

  lines.push('  done - end your turn, then auto-run the opponent if it becomes active.');
  lines.push('  status - show current life, resources, sheet essentials, and outcome.');

  return lines;
}

function formatResourceText(
  sheet: CombatCliResolvedSheet,
  resourceId: string,
  resources: CombatCliResourceStateByParticipant | undefined,
): string {
  const presetResource = sheet.resources.find((entry) => entry.id === resourceId);
  const liveResource = resources
    ? getCombatCliResource(resources, sheet.participantId, resourceId)
    : undefined;
  const resource = liveResource ?? presetResource;

  return resource ? ` (${resource.current}/${resource.maximum} available)` : '';
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
