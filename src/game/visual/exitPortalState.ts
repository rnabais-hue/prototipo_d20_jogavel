import type { InterestPoint } from '../../exploration/interestPoint';
import { getExitMarkerAvailability } from '../../rules/exitActivation';
import { DEBUG_EXIT_MARKER_REQUIREMENTS } from '../debug/debugExplorationConfig';

export type ExitPortalVisualState = 'locked' | 'available' | 'completed';

export function getExitPortalVisualState(
  point: InterestPoint,
  interestPoints: readonly InterestPoint[],
  requirements = DEBUG_EXIT_MARKER_REQUIREMENTS,
): ExitPortalVisualState {
  const availability = getExitMarkerAvailability(point, interestPoints, requirements);
  if (availability.activated) {
    return 'completed';
  }
  if (availability.available) {
    return 'available';
  }
  return 'locked';
}
