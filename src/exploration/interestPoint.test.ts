import { describe, expect, it } from 'vitest';
import {
  createInterestPoint,
  interactWithInterestPoint,
  markInterestPointInspected,
} from './interestPoint';

describe('createInterestPoint', () => {
  it('creates a minimal survey point with idle state', () => {
    expect(createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 4 })).toEqual({
      id: 'poi-1',
      label: 'Survey Beacon',
      kind: 'survey',
      cell: { x: 3, y: 4 },
      state: 'idle',
      debugFlagActive: false,
    });
  });

  it('accepts other debug point kinds', () => {
    expect(createInterestPoint('poi-2', 'Gate Switch', { x: 5, y: 2 }, 'switch').kind).toBe('switch');
    expect(createInterestPoint('poi-3', 'Exit Marker', { x: 6, y: 1 }, 'exit_marker').kind).toBe('exit_marker');
    expect(createInterestPoint('poi-4', 'Combat Trigger', { x: 8, y: 4 }, 'combat_trigger').kind).toBe('combat_trigger');
  });

  it('sets encounterPresetId correctly for combat triggers', () => {
    const pointWithDefault = createInterestPoint('poi-4', 'Combat Trigger', { x: 8, y: 4 }, 'combat_trigger');
    expect(pointWithDefault.encounterPresetId).toBe('quick-check');

    const pointWithPreset = createInterestPoint('poi-5', 'Combat Trigger 2', { x: 8, y: 5 }, 'combat_trigger', 'hard-encounter');
    expect(pointWithPreset.encounterPresetId).toBe('hard-encounter');

    const nonCombatPoint = createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 4 });
    expect(nonCombatPoint.encounterPresetId).toBeUndefined();
  });
});

describe('interactWithInterestPoint', () => {
  it('marks a survey point as inspected and reports discovery', () => {
    const point = createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 4 });

    expect(interactWithInterestPoint(point)).toEqual({
      point: {
        id: 'poi-1',
        label: 'Survey Beacon',
        kind: 'survey',
        cell: { x: 3, y: 4 },
        state: 'inspected',
        debugFlagActive: false,
      },
      effect: {
        type: 'survey_discovered',
        discoveryId: 'poi-1',
      },
    });
  });

  it('toggles switch state and returns the current flag value', () => {
    const point = createInterestPoint('poi-2', 'Gate Switch', { x: 5, y: 2 }, 'switch');

    const firstInteraction = interactWithInterestPoint(point);
    const secondInteraction = interactWithInterestPoint(firstInteraction.point);

    expect(firstInteraction.effect).toEqual({
      type: 'switch_toggled',
      active: true,
    });
    expect(firstInteraction.point.state).toBe('inspected');
    expect(firstInteraction.point.debugFlagActive).toBe(true);
    expect(secondInteraction.effect).toEqual({
      type: 'switch_toggled',
      active: false,
    });
    expect(secondInteraction.point.debugFlagActive).toBe(false);
  });

  it('marks an exit marker as inspected and reports activation', () => {
    const point = createInterestPoint('poi-3', 'Exit Marker', { x: 6, y: 1 }, 'exit_marker');

    expect(interactWithInterestPoint(point)).toEqual({
      point: {
        id: 'poi-3',
        label: 'Exit Marker',
        kind: 'exit_marker',
        cell: { x: 6, y: 1 },
        state: 'inspected',
        debugFlagActive: false,
      },
      effect: {
        type: 'exit_marker_activated',
        exitId: 'poi-3',
      },
    });
  });

  it('marks a combat trigger point as inspected and reports combat triggered', () => {
    const point = createInterestPoint('poi-4', 'Combat Trigger', { x: 8, y: 4 }, 'combat_trigger', 'boss-fight');

    expect(interactWithInterestPoint(point)).toEqual({
      point: {
        id: 'poi-4',
        label: 'Combat Trigger',
        kind: 'combat_trigger',
        cell: { x: 8, y: 4 },
        state: 'inspected',
        debugFlagActive: false,
        encounterPresetId: 'boss-fight',
      },
      effect: {
        type: 'combat_triggered',
        encounterPresetId: 'boss-fight',
      },
    });
  });
});

describe('markInterestPointInspected', () => {
  it('returns a new point with inspected state', () => {
    const point = createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 4 });

    const inspectedPoint = markInterestPointInspected(point);

    expect(inspectedPoint).toEqual({
      id: 'poi-1',
      label: 'Survey Beacon',
      kind: 'survey',
      cell: { x: 3, y: 4 },
      state: 'inspected',
      debugFlagActive: false,
    });
    expect(inspectedPoint).not.toBe(point);
    expect(point.state).toBe('idle');
  });

  it('returns the same point when already inspected', () => {
    const point = {
      ...createInterestPoint('poi-1', 'Survey Beacon', { x: 3, y: 4 }),
      state: 'inspected' as const,
    };

    expect(markInterestPointInspected(point)).toBe(point);
  });
});
