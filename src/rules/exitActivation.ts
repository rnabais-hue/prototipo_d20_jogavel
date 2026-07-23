import type { InterestPoint } from '../exploration/interestPoint';

export type ExitMarkerRequirement = {
  type: 'switch_active';
  switchId: string;
};

export type ExitMarkerRequirementsById = Readonly<
  Partial<Record<string, ExitMarkerRequirement>>
>;

export type ExitMarkerAvailability =
  | {
      available: true;
      activated: boolean;
    }
  | {
      available: false;
      activated: false;
      reason: 'switch_inactive';
      requirement: ExitMarkerRequirement;
    };

export function getExitMarkerAvailability(
  point: InterestPoint,
  interestPoints: readonly InterestPoint[],
  requirementsById: ExitMarkerRequirementsById = {},
): ExitMarkerAvailability {
  if (point.kind !== 'exit_marker') {
    return {
      available: true,
      activated: point.state === 'inspected',
    };
  }

  if (point.state === 'inspected') {
    return {
      available: true,
      activated: true,
    };
  }

  const requirement = requirementsById[point.id];

  if (!requirement) {
    return {
      available: true,
      activated: false,
    };
  }

  switch (requirement.type) {
    case 'switch_active': {
      const switchPoint = interestPoints.find((candidate) => candidate.id === requirement.switchId);

      if (switchPoint?.debugFlagActive) {
        return {
          available: true,
          activated: false,
        };
      }

      return {
        available: false,
        activated: false,
        reason: 'switch_inactive',
        requirement,
      };
    }
  }
}
