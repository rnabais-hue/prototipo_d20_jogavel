import type { InterestPoint } from '../exploration/interestPoint';
import type { GridCell } from '../movement/grid';
import { getManhattanDistance } from '../movement/moveRange';
import {
  getExitMarkerAvailability,
  type ExitMarkerRequirementsById,
} from './exitActivation';

export type InteractionAvailability =
  | {
      available: false;
      reason: 'none_in_range' | 'locked';
      point?: InterestPoint;
    }
  | {
      available: true;
      point: InterestPoint;
    };

export type InteractionStatus =
  | {
      status: 'none';
    }
  | {
      status: 'available';
      point: InterestPoint;
    }
  | {
      status: 'locked';
      point: InterestPoint;
      reason: 'exit_locked';
    }
  | {
      status: 'inspected';
      point: InterestPoint;
    };

export function getAvailableInteraction(
  actorCell: GridCell,
  points: readonly InterestPoint[],
  exitRequirementsById: ExitMarkerRequirementsById = {},
): InteractionAvailability {
  const status = getInteractionStatus(actorCell, points, exitRequirementsById);

  if (status.status === 'available') {
    return {
      available: true,
      point: status.point,
    };
  }

  if (status.status === 'locked') {
    return {
      available: false,
      reason: 'locked',
      point: status.point,
    };
  }

  return {
    available: false,
    reason: 'none_in_range',
  };
}

export function getInteractionStatus(
  actorCell: GridCell,
  points: readonly InterestPoint[],
  exitRequirementsById: ExitMarkerRequirementsById = {},
): InteractionStatus {
  const adjacentPoints = getOrthogonallyAdjacentPoints(actorCell, points);

  if (adjacentPoints.length === 0) {
    return {
      status: 'none',
    };
  }

  const availablePoint = adjacentPoints.find((point) =>
    isPointCurrentlyInteractable(point, points, exitRequirementsById),
  );

  if (availablePoint) {
    return {
      status: 'available',
      point: availablePoint,
    };
  }

  const lockedPoint = adjacentPoints.find((point) =>
    isPointLocked(point, points, exitRequirementsById),
  );

  if (lockedPoint) {
    return {
      status: 'locked',
      point: lockedPoint,
      reason: 'exit_locked',
    };
  }

  return {
    status: 'inspected',
    point: adjacentPoints[0],
  };
}

function getOrthogonallyAdjacentPoints(
  actorCell: GridCell,
  points: readonly InterestPoint[],
): InterestPoint[] {
  return points.filter((candidate) => getManhattanDistance(actorCell, candidate.cell) === 1);
}

function isPointCurrentlyInteractable(
  point: InterestPoint,
  allPoints: readonly InterestPoint[],
  exitRequirementsById: ExitMarkerRequirementsById,
): boolean {
  if (point.kind === 'switch') {
    return true;
  }

  if (point.kind === 'exit_marker') {
    return point.state === 'idle'
      && getExitMarkerAvailability(point, allPoints, exitRequirementsById).available;
  }

  return point.state === 'idle';
}

function isPointLocked(
  point: InterestPoint,
  allPoints: readonly InterestPoint[],
  exitRequirementsById: ExitMarkerRequirementsById,
): boolean {
  return point.kind === 'exit_marker'
    && point.state === 'idle'
    && !getExitMarkerAvailability(point, allPoints, exitRequirementsById).available;
}
