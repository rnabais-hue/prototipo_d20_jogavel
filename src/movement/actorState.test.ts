import { describe, expect, it } from 'vitest';
import {
  canActorAcceptMoveCommand,
  completeActorMove,
  createActorState,
  startActorMove,
} from './actorState';

describe('createActorState', () => {
  it('creates an idle actor at the provided grid cell', () => {
    expect(createActorState('actor-1', { x: 2, y: 3 })).toEqual({
      id: 'actor-1',
      currentCell: { x: 2, y: 3 },
      status: 'idle',
    });
  });
});

describe('canActorAcceptMoveCommand', () => {
  it('accepts movement commands while idle', () => {
    const actor = createActorState('actor-1', { x: 0, y: 0 });

    expect(canActorAcceptMoveCommand(actor)).toBe(true);
  });

  it('rejects movement commands while moving', () => {
    expect(
      canActorAcceptMoveCommand({
        id: 'actor-1',
        currentCell: { x: 0, y: 0 },
        status: 'moving',
        targetCell: { x: 1, y: 0 },
      }),
    ).toBe(false);
  });
});

describe('startActorMove', () => {
  it('starts movement from an idle actor to the target cell', () => {
    const actor = createActorState('actor-1', { x: 0, y: 0 });

    expect(startActorMove(actor, { x: 2, y: 1 })).toEqual({
      id: 'actor-1',
      currentCell: { x: 0, y: 0 },
      status: 'moving',
      targetCell: { x: 2, y: 1 },
    });
  });

  it('rejects a new destination while the actor is already moving', () => {
    const actor = startActorMove(createActorState('actor-1', { x: 0, y: 0 }), {
      x: 2,
      y: 1,
    });

    expect(startActorMove(actor, { x: 3, y: 1 })).toBe(actor);
  });

  it('does not mutate the original actor state', () => {
    const actor = createActorState('actor-1', { x: 0, y: 0 });

    const nextActor = startActorMove(actor, { x: 2, y: 1 });

    expect(nextActor).not.toBe(actor);
    expect(actor).toEqual({
      id: 'actor-1',
      currentCell: { x: 0, y: 0 },
      status: 'idle',
    });
  });
});

describe('completeActorMove', () => {
  it('completes movement by returning an idle actor at the target cell', () => {
    const actor = startActorMove(createActorState('actor-1', { x: 0, y: 0 }), {
      x: 2,
      y: 1,
    });

    expect(completeActorMove(actor)).toEqual({
      id: 'actor-1',
      currentCell: { x: 2, y: 1 },
      status: 'idle',
    });
  });

  it('removes targetCell from the completed actor state', () => {
    const actor = startActorMove(createActorState('actor-1', { x: 0, y: 0 }), {
      x: 2,
      y: 1,
    });

    const completedActor = completeActorMove(actor);

    expect('targetCell' in completedActor).toBe(false);
  });

  it('does not mutate the original moving actor state', () => {
    const actor = startActorMove(createActorState('actor-1', { x: 0, y: 0 }), {
      x: 2,
      y: 1,
    });

    const completedActor = completeActorMove(actor);

    expect(completedActor).not.toBe(actor);
    expect(actor).toEqual({
      id: 'actor-1',
      currentCell: { x: 0, y: 0 },
      status: 'moving',
      targetCell: { x: 2, y: 1 },
    });
  });

  it('leaves an idle actor unchanged', () => {
    const actor = createActorState('actor-1', { x: 2, y: 3 });

    expect(completeActorMove(actor)).toBe(actor);
  });
});