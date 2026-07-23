import type { CombatCliResolvedSheet } from './combatCliPresets';

export type CombatCliResourceState = {
  participantId: string;
  id: string;
  label: string;
  current: number;
  maximum: number;
};

export type CombatCliResourceStateByParticipant = Readonly<
  Record<string, readonly CombatCliResourceState[]>
>;

export type CombatCliSpendResourceResult =
  | {
      ok: true;
      resources: CombatCliResourceStateByParticipant;
      resource: CombatCliResourceState;
    }
  | {
      ok: false;
      error:
        | {
            code: 'unknown_resource';
            participantId: string;
            resourceId: string;
          }
        | {
            code: 'invalid_resource_cost';
            cost: number;
          }
        | {
            code: 'insufficient_resource';
            participantId: string;
            resourceId: string;
            current: number;
            cost: number;
          };
    };

export function createCombatCliResourceState(
  sheets: readonly CombatCliResolvedSheet[],
): CombatCliResourceStateByParticipant {
  return Object.fromEntries(
    sheets.map((sheet) => [
      sheet.participantId,
      sheet.resources.map((resource) => ({
        participantId: sheet.participantId,
        id: resource.id,
        label: resource.label,
        current: resource.current,
        maximum: resource.maximum,
      })),
    ]),
  );
}

export function getCombatCliResource(
  resources: CombatCliResourceStateByParticipant,
  participantId: string,
  resourceId: string,
): CombatCliResourceState | undefined {
  return resources[participantId]?.find((resource) => resource.id === resourceId);
}

export function canSpendCombatCliResource(
  resources: CombatCliResourceStateByParticipant,
  participantId: string,
  resourceId: string,
  cost: number,
): boolean {
  const resource = getCombatCliResource(resources, participantId, resourceId);

  return (
    Number.isInteger(cost) &&
    cost >= 0 &&
    resource !== undefined &&
    resource.current >= cost
  );
}

export function spendCombatCliResource(
  resources: CombatCliResourceStateByParticipant,
  participantId: string,
  resourceId: string,
  cost: number,
): CombatCliSpendResourceResult {
  if (!Number.isInteger(cost) || cost < 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_resource_cost',
        cost,
      },
    };
  }

  const resource = getCombatCliResource(resources, participantId, resourceId);
  if (!resource) {
    return {
      ok: false,
      error: {
        code: 'unknown_resource',
        participantId,
        resourceId,
      },
    };
  }

  if (resource.current < cost) {
    return {
      ok: false,
      error: {
        code: 'insufficient_resource',
        participantId,
        resourceId,
        current: resource.current,
        cost,
      },
    };
  }

  const nextResource: CombatCliResourceState = {
    ...resource,
    current: resource.current - cost,
  };
  const nextResourcesForParticipant = (resources[participantId] ?? []).map((entry) =>
    entry.id === resourceId ? nextResource : entry,
  );

  return {
    ok: true,
    resources: {
      ...resources,
      [participantId]: nextResourcesForParticipant,
    },
    resource: nextResource,
  };
}