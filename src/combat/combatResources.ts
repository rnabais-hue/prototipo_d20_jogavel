import type { CombatResolvedSheet } from '../content/combatPresets';

export type CombatResourceState = {
  participantId: string;
  id: string;
  label: string;
  current: number;
  maximum: number;
};

export type CombatResourceStateByParticipant = Readonly<
  Record<string, readonly CombatResourceState[]>
>;

export type CombatSpendResourceResult =
  | {
      ok: true;
      resources: CombatResourceStateByParticipant;
      resource: CombatResourceState;
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

export function createCombatResourceState(
  sheets: readonly CombatResolvedSheet[],
): CombatResourceStateByParticipant {
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

export function getCombatResource(
  resources: CombatResourceStateByParticipant,
  participantId: string,
  resourceId: string,
): CombatResourceState | undefined {
  return resources[participantId]?.find((resource) => resource.id === resourceId);
}

export function canSpendCombatResource(
  resources: CombatResourceStateByParticipant,
  participantId: string,
  resourceId: string,
  cost: number,
): boolean {
  const resource = getCombatResource(resources, participantId, resourceId);

  return (
    Number.isInteger(cost) &&
    cost >= 0 &&
    resource !== undefined &&
    resource.current >= cost
  );
}

export function spendCombatResource(
  resources: CombatResourceStateByParticipant,
  participantId: string,
  resourceId: string,
  cost: number,
): CombatSpendResourceResult {
  if (!Number.isInteger(cost) || cost < 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_resource_cost',
        cost,
      },
    };
  }

  const resource = getCombatResource(resources, participantId, resourceId);
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

  const nextResource: CombatResourceState = {
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