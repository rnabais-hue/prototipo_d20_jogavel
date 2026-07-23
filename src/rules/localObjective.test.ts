import { describe, expect, it } from 'vitest';
import {
  createInterestPoint,
  interactWithInterestPoint,
} from '../exploration/interestPoint';
import type { ExitMarkerRequirementsById } from './exitActivation';
import { getLocalObjectiveSummary } from './localObjective';
const exitRequirements: ExitMarkerRequirementsById = {
  'poi-exit-1': {
    type: 'switch_active',
    switchId: 'poi-switch-1',
  },
};
describe('getLocalObjectiveSummary', () => {
  it('shows the switch objective before the switch is active', () => {
    const switchPoint = createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch');
    const exitPoint = createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker');
    expect(getLocalObjectiveSummary([switchPoint, exitPoint], exitRequirements)).toEqual({
      state: 'activate_exit_switch',
      text: 'objective: activate the exit switch',
    });
  });
  it('shows the exit objective after the switch is active and before the exit is activated', () => {
    const toggledSwitch = interactWithInterestPoint(
      createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch'),
    ).point;
    const exitPoint = createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker');
    expect(getLocalObjectiveSummary([toggledSwitch, exitPoint], exitRequirements)).toEqual({
      state: 'activate_exit_marker',
      text: 'objective: activate the exit marker',
    });
  });
  it('shows local completion after the exit marker is activated', () => {
    const toggledSwitch = interactWithInterestPoint(
      createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch'),
    ).point;
    const activatedExit = interactWithInterestPoint(
      createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker'),
    ).point;
    expect(getLocalObjectiveSummary([toggledSwitch, activatedExit], exitRequirements)).toEqual({
      state: 'local_route_complete',
      text: 'objective: local route complete',
    });
  });
});