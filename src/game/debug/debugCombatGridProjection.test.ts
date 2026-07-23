import { describe, expect, it } from 'vitest';
import { advanceCombatSessionTurn, createCombatSessionFromPresetId } from '../../combat/combatSession';
import { projectCombatCellToWorld, projectCombatPointerToCell, projectDebugCombatGrid } from './debugCombatGridProjection';

const layout = { originX: 100, originY: 80, cellSize: 40 };

describe('debug combat grid projection', () => {
  it('projects pointer positions with origin, boundaries and custom cell sizes', () => {
    const bounds = { width: 10, height: 8 };
    expect(projectCombatPointerToCell({ x: 200, y: 260 }, layout, bounds)).toEqual({ x: 2, y: 4 });
    expect(projectCombatPointerToCell({ x: 140, y: 120 }, layout, bounds)).toEqual({ x: 1, y: 1 });
    expect(projectCombatPointerToCell({ x: 499.999, y: 399.999 }, layout, bounds)).toEqual({ x: 9, y: 7 });
    expect(projectCombatPointerToCell({ x: 99, y: 100 }, layout, bounds)).toBeUndefined();
    expect(projectCombatPointerToCell({ x: 120, y: 79 }, layout, bounds)).toBeUndefined();
    expect(projectCombatPointerToCell({ x: 500, y: 100 }, layout, bounds)).toBeUndefined();
    expect(projectCombatPointerToCell({ x: 120, y: 400 }, layout, bounds)).toBeUndefined();
    expect(projectCombatPointerToCell({ x: 245, y: 211 }, { originX: 17, originY: 31, cellSize: 24 }, bounds)).toEqual({ x: 9, y: 7 });
  });
  it('centers cells and projects session positions', () => {
    expect(projectCombatCellToWorld({ x: 2, y: 4 }, layout)).toEqual({ x: 200, y: 260 });
    const items = projectDebugCombatGrid(createCombatSessionFromPresetId(), layout).combatants;
    expect(items.map(({ cell, world, active }) => ({ cell, world, active }))).toEqual([
      { cell: { x: 2, y: 4 }, world: { x: 200, y: 260 }, active: true },
      { cell: { x: 6, y: 4 }, world: { x: 360, y: 260 }, active: false },
    ]);
  });
  it('updates the active marker after turn change', () => {
    const session = createCombatSessionFromPresetId();
    expect(advanceCombatSessionTurn(session).ok).toBe(true);
    expect(projectDebugCombatGrid(session, layout).combatants.map((item) => item.active)).toEqual([false, true]);
  });
  it('filters occupied and blocked cells and handles zero remaining movement', () => {
    const session = createCombatSessionFromPresetId();
    session.positioning = { ...session.positioning, blockedCells: [{ x: 2, y: 3 }] };
    let cells = projectDebugCombatGrid(session, layout).reachableCells;
    expect(cells).not.toContainEqual({ x: 6, y: 4 });
    expect(cells).not.toContainEqual({ x: 2, y: 3 });
    session.movementAllowance = { ...session.movementAllowance, remaining: 0 };
    cells = projectDebugCombatGrid(session, layout).reachableCells;
    expect(cells).toEqual([]);
  });
  it('identifies the player by preset participant id, not position entry order', () => {
    const session = createCombatSessionFromPresetId();
    session.positioning = { ...session.positioning, positions: Object.fromEntries(Object.entries(session.positioning.positions).reverse()) };
    const items = projectDebugCombatGrid(session, layout).combatants;
    expect(items[0].participantId).not.toBe(session.preset.sheets[0].participantId);
    expect(items).toContainEqual(expect.objectContaining({ participantId: session.preset.sheets[0].participantId, isPlayer: true }));
  });
});
