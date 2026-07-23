import type { GridCell } from '../movement/grid';

export type InterestPointKind = 'survey' | 'switch' | 'exit_marker' | 'combat_trigger';

export type InterestPointState = 'idle' | 'inspected';

export type InterestPointInteractionEffect =
  | {
      type: 'survey_discovered';
      discoveryId: string;
    }
  | {
      type: 'switch_toggled';
      active: boolean;
    }
  | {
      type: 'exit_marker_activated';
      exitId: string;
    }
  | {
      type: 'combat_triggered';
      encounterPresetId: string;
    };

export type InterestPointInteractionResult = {
  point: InterestPoint;
  effect: InterestPointInteractionEffect;
};

export type InterestPoint = {
  id: string;
  label: string;
  kind: InterestPointKind;
  cell: GridCell;
  state: InterestPointState;
  debugFlagActive: boolean;
  encounterPresetId?: string;
};

export function createInterestPoint(
  id: string,
  label: string,
  cell: GridCell,
  kind: InterestPointKind = 'survey',
  encounterPresetId?: string,
): InterestPoint {
  return {
    id,
    label,
    kind,
    cell,
    state: 'idle',
    debugFlagActive: false,
    encounterPresetId: kind === 'combat_trigger' ? (encounterPresetId ?? 'quick-check') : encounterPresetId,
  };
}

export function interactWithInterestPoint(
  point: InterestPoint,
): InterestPointInteractionResult {
  switch (point.kind) {
    case 'survey': {
      const nextPoint = markInterestPointInspected(point);

      return {
        point: nextPoint,
        effect: {
          type: 'survey_discovered',
          discoveryId: point.id,
        },
      };
    }
    case 'switch': {
      const nextPoint: InterestPoint = {
        ...point,
        state: 'inspected',
        debugFlagActive: !point.debugFlagActive,
      };

      return {
        point: nextPoint,
        effect: {
          type: 'switch_toggled',
          active: nextPoint.debugFlagActive,
        },
      };
    }
    case 'exit_marker': {
      const nextPoint = markInterestPointInspected(point);

      return {
        point: nextPoint,
        effect: {
          type: 'exit_marker_activated',
          exitId: point.id,
        },
      };
    }
    case 'combat_trigger': {
      const nextPoint = markInterestPointInspected(point);

      return {
        point: nextPoint,
        effect: {
          type: 'combat_triggered',
          encounterPresetId: point.encounterPresetId ?? 'quick-check',
        },
      };
    }
  }
}

export function markInterestPointInspected(point: InterestPoint): InterestPoint {
  if (point.state === 'inspected') {
    return point;
  }

  return {
    ...point,
    state: 'inspected',
  };
}
