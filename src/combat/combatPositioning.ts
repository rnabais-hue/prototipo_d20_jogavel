import {
  isCellInsideGrid,
  type GridBounds,
  type GridCell,
} from '../movement/grid';
import {
  getManhattanDistance,
  isCellWithinMoveRange,
} from '../movement/moveRange';

export type CombatParticipantId = string;

export type CombatParticipantPlacement = {
  participantId: CombatParticipantId;
  cell: GridCell;
};

export type CombatPositioningState = {
  bounds: GridBounds;
  positions: Readonly<Record<CombatParticipantId, GridCell>>;
  blockedCells: readonly GridCell[];
};

export type CombatMovementInput = {
  participantId: CombatParticipantId;
  destination: GridCell;
  range: number;
};

export type CombatMovementRejectionReason =
  | 'unknown_participant'
  | 'outside_grid'
  | 'occupied'
  | 'blocked'
  | 'out_of_range';

export type CombatMovementValidation =
  | {
      ok: true;
      from: GridCell;
      destination: GridCell;
      distance: number;
    }
  | {
      ok: false;
      reason: CombatMovementRejectionReason;
      participantId: CombatParticipantId;
      destination: GridCell;
    };

export type CombatMoveParticipantResult =
  | {
      ok: true;
      state: CombatPositioningState;
      from: GridCell;
      destination: GridCell;
      distance: number;
    }
  | {
      ok: false;
      reason: CombatMovementRejectionReason;
      participantId: CombatParticipantId;
      destination: GridCell;
    };

export function createCombatPositioningState(input: {
  bounds: GridBounds;
  placements: readonly CombatParticipantPlacement[];
  blockedCells?: readonly GridCell[];
}): CombatPositioningState {
  const positions: Record<CombatParticipantId, GridCell> = {};

  for (const placement of input.placements) {
    positions[placement.participantId] = cloneCell(placement.cell);
  }

  return {
    bounds: { ...input.bounds },
    positions,
    blockedCells: input.blockedCells?.map(cloneCell) ?? [],
  };
}

export function getCombatParticipantCell(
  state: CombatPositioningState,
  participantId: CombatParticipantId,
): GridCell | undefined {
  const cell = state.positions[participantId];

  return cell ? cloneCell(cell) : undefined;
}

export function isCombatCellOccupied(
  state: CombatPositioningState,
  cell: GridCell,
  options: {
    ignoreParticipantId?: CombatParticipantId;
  } = {},
): boolean {
  return Object.entries(state.positions).some(([participantId, occupiedCell]) => (
    participantId !== options.ignoreParticipantId
    && areSameGridCell(occupiedCell, cell)
  ));
}

export function isCombatCellBlocked(
  state: CombatPositioningState,
  cell: GridCell,
): boolean {
  return state.blockedCells.some((blockedCell) => areSameGridCell(blockedCell, cell));
}

export function validateCombatMovementDestination(
  state: CombatPositioningState,
  input: CombatMovementInput,
): CombatMovementValidation {
  const from = state.positions[input.participantId];
  if (!from) {
    return rejectMovement('unknown_participant', input);
  }

  if (!isCellInsideGrid(input.destination, state.bounds)) {
    return rejectMovement('outside_grid', input);
  }

  if (
    isCombatCellOccupied(state, input.destination, {
      ignoreParticipantId: input.participantId,
    })
  ) {
    return rejectMovement('occupied', input);
  }

  if (isCombatCellBlocked(state, input.destination)) {
    return rejectMovement('blocked', input);
  }

  const distance = getManhattanDistance(from, input.destination);
  if (!isCellWithinMoveRange(from, input.destination, input.range)) {
    return rejectMovement('out_of_range', input);
  }

  return {
    ok: true,
    from: cloneCell(from),
    destination: cloneCell(input.destination),
    distance,
  };
}

export function moveCombatParticipant(
  state: CombatPositioningState,
  input: CombatMovementInput,
): CombatMoveParticipantResult {
  const validation = validateCombatMovementDestination(state, input);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    state: {
      bounds: { ...state.bounds },
      positions: {
        ...state.positions,
        [input.participantId]: cloneCell(input.destination),
      },
      blockedCells: state.blockedCells.map(cloneCell),
    },
    from: validation.from,
    destination: validation.destination,
    distance: validation.distance,
  };
}

export function areSameGridCell(left: GridCell, right: GridCell): boolean {
  return left.x === right.x && left.y === right.y;
}

function rejectMovement(
  reason: CombatMovementRejectionReason,
  input: CombatMovementInput,
): Extract<CombatMovementValidation, { ok: false }> {
  return {
    ok: false,
    reason,
    participantId: input.participantId,
    destination: cloneCell(input.destination),
  };
}

function cloneCell(cell: GridCell): GridCell {
  return {
    x: cell.x,
    y: cell.y,
  };
}
