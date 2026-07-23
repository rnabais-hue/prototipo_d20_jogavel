import { createInterestPoint, type InterestPoint } from '../../exploration/interestPoint';
import type { ExplorationMap } from '../../exploration/explorationMap';
import {
  buildEffectiveExplorationMap,
  type SwitchControlledBlocker,
} from '../../exploration/switchControlledMap';
import type { GridCell } from '../../movement/grid';
import type { ExitMarkerRequirementsById } from '../../rules/exitActivation';

export const DEBUG_EXPLORATION_GRID = {
  cellSize: 32,
  width: 18,
  height: 10,
  originX: 112,
  originY: 68,
} as const;

export const DEBUG_EXPLORATION_ENTITY_START_CELL: GridCell = { x: 2, y: 2 };

export const DEBUG_INTEREST_POINTS: readonly InterestPoint[] = [
  createInterestPoint('poi-survey-1', 'Survey Beacon', { x: 4, y: 2 }, 'survey'),
  createInterestPoint('poi-switch-1', 'Gate Switch', { x: 10, y: 6 }, 'switch'),
  createInterestPoint('poi-exit-1', 'Exit Marker', { x: 14, y: 3 }, 'exit_marker'),
  createInterestPoint('poi-combat-1', 'Combat Encounter', { x: 8, y: 4 }, 'combat_trigger', 'challenging-duel'),
];

export const DEBUG_EXIT_MARKER_REQUIREMENTS: ExitMarkerRequirementsById = {
  'poi-exit-1': {
    type: 'switch_active',
    switchId: 'poi-switch-1',
  },
};

export const DEBUG_ACTOR_MOVE_RANGE = 4;

export const DEBUG_EXPLORATION_BASE_BLOCKED_CELLS: readonly GridCell[] = [
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 8, y: 2 },
  { x: 4, y: 7 },
];

export const DEBUG_SWITCH_CONTROLLED_BLOCKERS: readonly SwitchControlledBlocker[] = [
  {
    switchId: 'poi-switch-1',
    cells: [
      { x: 11, y: 5 },
      { x: 12, y: 5 },
      { x: 13, y: 5 },
    ],
    blockedWhenActive: false,
  },
];

export const DEBUG_EXPLORATION_BASE_MAP: ExplorationMap = {
  bounds: DEBUG_EXPLORATION_GRID,
  blockedCells: DEBUG_EXPLORATION_BASE_BLOCKED_CELLS,
};

export function createDebugExplorationMap(
  interestPoints: readonly InterestPoint[],
): ExplorationMap {
  return buildEffectiveExplorationMap(
    DEBUG_EXPLORATION_BASE_MAP,
    interestPoints,
    DEBUG_SWITCH_CONTROLLED_BLOCKERS,
  );
}

export const DEBUG_EXPLORATION_INITIAL_MAP: ExplorationMap =
  createDebugExplorationMap(DEBUG_INTEREST_POINTS);
