import { describe, expect, it } from 'vitest';
import {
  createInterestPoint,
  interactWithInterestPoint,
} from '../exploration/interestPoint';
import {
  getAvailableInteraction,
  getInteractionStatus,
} from './interactionAvailability';

const exitRequirements = {
  'poi-exit-locked': {
    type: 'switch_active' as const,
    switchId: 'poi-switch-1',
  },
};

describe('getAvailableInteraction', () => {
  it('returns the idle point when it is orthogonally adjacent', () => {
    const point = createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 });

    expect(getAvailableInteraction({ x: 2, y: 2 }, [point])).toEqual({
      available: true,
      point,
    });
  });

  it('ignores diagonal points', () => {
    const point = createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 3 });

    expect(getAvailableInteraction({ x: 2, y: 2 }, [point])).toEqual({
      available: false,
      reason: 'none_in_range',
    });
  });

  it('returns an adjacent idle point even when another adjacent point is already inspected', () => {
    const inspectedPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }),
    ).point;
    const idlePoint = createInterestPoint('poi-2', 'Gate Switch', { x: 2, y: 3 }, 'switch');

    expect(getAvailableInteraction({ x: 2, y: 2 }, [inspectedPoint, idlePoint])).toEqual({
      available: true,
      point: idlePoint,
    });
  });

  it('keeps an adjacent switch available after its first interaction', () => {
    const switchPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Gate Switch', { x: 3, y: 2 }, 'switch'),
    ).point;

    expect(getAvailableInteraction({ x: 2, y: 2 }, [switchPoint])).toEqual({
      available: true,
      point: switchPoint,
    });
  });

  it('reports a locked exit marker before its required switch is on', () => {
    const switchPoint = createInterestPoint('poi-switch-1', 'Gate Switch', { x: 3, y: 2 }, 'switch');
    const exitPoint = createInterestPoint('poi-exit-locked', 'Exit Marker', { x: 2, y: 3 }, 'exit_marker');

    expect(getAvailableInteraction({ x: 1, y: 3 }, [switchPoint, exitPoint], exitRequirements)).toEqual({
      available: false,
      reason: 'locked',
      point: exitPoint,
    });
  });

  it('returns an exit marker as available once its required switch is on', () => {
    const switchPoint = interactWithInterestPoint(
      createInterestPoint('poi-switch-1', 'Gate Switch', { x: 3, y: 2 }, 'switch'),
    ).point;
    const exitPoint = createInterestPoint('poi-exit-locked', 'Exit Marker', { x: 2, y: 3 }, 'exit_marker');

    expect(getAvailableInteraction({ x: 1, y: 3 }, [switchPoint, exitPoint], exitRequirements)).toEqual({
      available: true,
      point: exitPoint,
    });
  });
});

describe('getInteractionStatus', () => {
  it('reports an inspected adjacent point after interaction', () => {
    const point = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }),
    ).point;

    expect(getInteractionStatus({ x: 2, y: 2 }, [point])).toEqual({
      status: 'inspected',
      point,
    });
  });

  it('prioritizes an adjacent idle point over adjacent inspected points', () => {
    const inspectedPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }),
    ).point;
    const idlePoint = createInterestPoint('poi-2', 'Gate Switch', { x: 2, y: 3 }, 'switch');

    expect(getInteractionStatus({ x: 2, y: 2 }, [inspectedPoint, idlePoint])).toEqual({
      status: 'available',
      point: idlePoint,
    });
  });

  it('reports available for an inspected adjacent switch so it can be toggled again', () => {
    const switchPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Gate Switch', { x: 3, y: 2 }, 'switch'),
    ).point;

    expect(getInteractionStatus({ x: 2, y: 2 }, [switchPoint])).toEqual({
      status: 'available',
      point: switchPoint,
    });
  });

  it('reports locked for an idle exit marker whose local requirement is not ready', () => {
    const switchPoint = createInterestPoint('poi-switch-1', 'Gate Switch', { x: 3, y: 2 }, 'switch');
    const exitPoint = createInterestPoint('poi-exit-locked', 'Exit Marker', { x: 2, y: 3 }, 'exit_marker');

    expect(getInteractionStatus({ x: 2, y: 2 }, [switchPoint, exitPoint], exitRequirements)).toEqual({
      status: 'available',
      point: switchPoint,
    });
    expect(getInteractionStatus({ x: 1, y: 3 }, [switchPoint, exitPoint], exitRequirements)).toEqual({
      status: 'locked',
      point: exitPoint,
      reason: 'exit_locked',
    });
  });

  it('keeps survey and exit marker non-repeatable after interaction', () => {
    const surveyPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }, 'survey'),
    ).point;
    const exitMarkerPoint = interactWithInterestPoint(
      createInterestPoint('poi-2', 'Exit Marker', { x: 2, y: 3 }, 'exit_marker'),
    ).point;

    expect(getInteractionStatus({ x: 2, y: 2 }, [surveyPoint])).toEqual({
      status: 'inspected',
      point: surveyPoint,
    });
    expect(getInteractionStatus({ x: 2, y: 2 }, [exitMarkerPoint])).toEqual({
      status: 'inspected',
      point: exitMarkerPoint,
    });
  });

  it('reports inspected when all adjacent points are already inspected', () => {
    const firstPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }),
    ).point;
    const secondPoint = interactWithInterestPoint(
      createInterestPoint('poi-2', 'Exit Marker', { x: 2, y: 3 }, 'exit_marker'),
    ).point;

    expect(getInteractionStatus({ x: 2, y: 2 }, [firstPoint, secondPoint])).toEqual({
      status: 'inspected',
      point: firstPoint,
    });
  });

  it('keeps prioritization coherent when switch and single-use points are mixed', () => {
    const resolvedSurveyPoint = interactWithInterestPoint(
      createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 2 }, 'survey'),
    ).point;
    const reusableSwitchPoint = interactWithInterestPoint(
      createInterestPoint('poi-2', 'Gate Switch', { x: 2, y: 3 }, 'switch'),
    ).point;
    const idleExitMarkerPoint = createInterestPoint('poi-3', 'Exit Marker', { x: 1, y: 2 }, 'exit_marker');

    expect(getInteractionStatus({ x: 2, y: 2 }, [resolvedSurveyPoint, reusableSwitchPoint])).toEqual({
      status: 'available',
      point: reusableSwitchPoint,
    });
    expect(getInteractionStatus({ x: 2, y: 2 }, [reusableSwitchPoint, idleExitMarkerPoint])).toEqual({
      status: 'available',
      point: reusableSwitchPoint,
    });
  });

  it('reports none when no adjacent point exists', () => {
    const point = createInterestPoint('poi-1', 'Survey Beacon', { x: 5, y: 5 });

    expect(getInteractionStatus({ x: 2, y: 2 }, [point])).toEqual({
      status: 'none',
    });
  });
});
