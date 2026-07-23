import { describe, expect, it } from 'vitest';
import {
  createInterestPoint,
  interactWithInterestPoint,
} from '../exploration/interestPoint';
import {
  getExitMarkerAvailability,
  type ExitMarkerRequirementsById,
} from './exitActivation';

const exitRequirements: ExitMarkerRequirementsById = {
  'poi-exit-1': {
    type: 'switch_active',
    switchId: 'poi-switch-1',
  },
};

describe('getExitMarkerAvailability', () => {
  it('blocks an exit marker before its required switch is on', () => {
    const switchPoint = createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch');
    const exitPoint = createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker');

    expect(getExitMarkerAvailability(exitPoint, [switchPoint, exitPoint], exitRequirements)).toEqual({
      available: false,
      activated: false,
      reason: 'switch_inactive',
      requirement: {
        type: 'switch_active',
        switchId: 'poi-switch-1',
      },
    });
  });

  it('unlocks an exit marker after its required switch is on', () => {
    const toggledSwitch = interactWithInterestPoint(
      createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch'),
    ).point;
    const exitPoint = createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker');

    expect(getExitMarkerAvailability(exitPoint, [toggledSwitch, exitPoint], exitRequirements)).toEqual({
      available: true,
      activated: false,
    });
  });

  it('allows exit activation once the requirement is satisfied', () => {
    const toggledSwitch = interactWithInterestPoint(
      createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch'),
    ).point;
    const exitPoint = createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker');
    const availability = getExitMarkerAvailability(exitPoint, [toggledSwitch, exitPoint], exitRequirements);

    expect(availability).toEqual({
      available: true,
      activated: false,
    });
    expect(interactWithInterestPoint(exitPoint)).toEqual({
      point: {
        id: 'poi-exit-1',
        label: 'Exit Marker',
        kind: 'exit_marker',
        cell: { x: 2, y: 0 },
        state: 'inspected',
        debugFlagActive: false,
      },
      effect: {
        type: 'exit_marker_activated',
        exitId: 'poi-exit-1',
      },
    });
  });

  it('keeps an already activated exit marker stable even if the switch turns off again', () => {
    const activatedExit = interactWithInterestPoint(
      createInterestPoint('poi-exit-1', 'Exit Marker', { x: 2, y: 0 }, 'exit_marker'),
    ).point;
    const switchPoint = createInterestPoint('poi-switch-1', 'Gate Switch', { x: 1, y: 0 }, 'switch');

    expect(getExitMarkerAvailability(activatedExit, [switchPoint, activatedExit], exitRequirements)).toEqual({
      available: true,
      activated: true,
    });
  });
});
