import type { GridCell } from './grid';

export type ActorStatus = 'idle' | 'moving';

export type IdleActorState = {
  id: string;
  currentCell: GridCell;
  status: 'idle';
};

export type MovingActorState = {
  id: string;
  currentCell: GridCell;
  status: 'moving';
  targetCell: GridCell;
};

export type ActorState = IdleActorState | MovingActorState;

export function createActorState(
  id: string,
  currentCell: GridCell,
): IdleActorState {
  return {
    id,
    currentCell,
    status: 'idle',
  };
}

export function canActorAcceptMoveCommand(actor: ActorState): boolean {
  return actor.status === 'idle';
}

export function startActorMove(
  actor: ActorState,
  targetCell: GridCell,
): ActorState {
  if (!canActorAcceptMoveCommand(actor)) {
    return actor;
  }

  return {
    ...actor,
    status: 'moving',
    targetCell,
  };
}

export function completeActorMove(actor: ActorState): IdleActorState {
  if (actor.status === 'idle') {
    return actor;
  }

  return {
    id: actor.id,
    currentCell: actor.targetCell,
    status: 'idle',
  };
}