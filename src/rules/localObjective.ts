import type { InterestPoint } from '../exploration/interestPoint';
import {
  getExitMarkerAvailability,
  type ExitMarkerRequirementsById,
} from './exitActivation';
export type LocalObjectiveState =
  | 'activate_exit_switch'
  | 'activate_exit_marker'
  | 'local_route_complete';
export type LocalObjectiveSummary = {
  state: LocalObjectiveState;
  text: string;
};
const LOCAL_OBJECTIVE_TEXT: Record<LocalObjectiveState, string> = {
  activate_exit_switch: 'objective: activate the exit switch',
  activate_exit_marker: 'objective: activate the exit marker',
  local_route_complete: 'objective: local route complete',
};
export function getLocalObjectiveSummary(
  interestPoints: readonly InterestPoint[],
  exitRequirementsById: ExitMarkerRequirementsById = {},
): LocalObjectiveSummary {
  const exitMarkers = interestPoints.filter((point) => point.kind === 'exit_marker');
  if (exitMarkers.some((point) => point.state === 'inspected')) {
    return createLocalObjectiveSummary('local_route_complete');
  }
  if (
    exitMarkers.some((point) =>
      getExitMarkerAvailability(point, interestPoints, exitRequirementsById).available)
  ) {
    return createLocalObjectiveSummary('activate_exit_marker');
  }
  return createLocalObjectiveSummary('activate_exit_switch');
}
function createLocalObjectiveSummary(
  state: LocalObjectiveState,
): LocalObjectiveSummary {
  return {
    state,
    text: LOCAL_OBJECTIVE_TEXT[state],
  };
}