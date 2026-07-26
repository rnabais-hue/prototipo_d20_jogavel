import { describe, it, expect } from 'vitest';
import { calculateCombatLayout } from './combatLayoutHelper';

describe('combatLayoutHelper', () => {
  it('keeps the combat arena on an integer pixel grid at 800x450', () => {
    const layout = calculateCombatLayout(800, 450);

    // Grid checks
    expect(layout.grid.cols).toBe(10);
    expect(layout.grid.rows).toBe(8);
    expect(layout.grid.originX).toBe(112);
    expect(layout.grid.originY).toBe(52);
    expect(layout.grid.cellSize).toBe(32);
    expect(Number.isInteger(layout.grid.originX)).toBe(true);
    expect(Number.isInteger(layout.grid.originY)).toBe(true);
    expect(Number.isInteger(layout.grid.cellSize)).toBe(true);

    expect(layout.console).toMatchObject({ x: 472, y: 64, width: 236, height: 280 });
    expect(layout.grid.originX + layout.grid.width).toBeLessThan(layout.console.x);

    expect(layout.exploration.hud.objective.width).toBe(232);
    expect(layout.exploration.hud.interaction.width).toBe(232);
    expect(layout.exploration.hud.paddingX).toBe(4);
    expect(layout.exploration.hud.paddingY).toBe(3);

    // HP Bars check
    expect(layout.hpBars.player).toMatchObject({ x: 480, y: 92, width: 220 });
    expect(layout.hpBars.opponent).toMatchObject({ x: 480, y: 124, width: 220 });

    // Turn indicator check
    expect(layout.turnIndicator.x).toBe(590);
    expect(layout.turnIndicator.y).toBe(16);

    // Debug diagnostics checks (no degradation for standard size)
    expect(layout.hud.objective.visible).toBe(true);
    expect(layout.hud.interaction.visible).toBe(true);
    expect(layout.hud.fontSize).toBe('11px');

  });

  it('fits the arena, outer tile border, and side console in the 640x360 logical canvas', () => {
    const layout = calculateCombatLayout(640, 360);

    expect(layout.grid).toMatchObject({
      originX: 32,
      originY: 52,
      cellSize: 32,
      width: 320,
      height: 256,
    });
    expect(layout.grid.originX - layout.grid.cellSize).toBe(0);
    expect(layout.grid.originY - layout.grid.cellSize).toBe(20);
    expect(layout.grid.originX + layout.grid.width + layout.grid.cellSize).toBe(384);
    expect(layout.grid.originY + layout.grid.height + layout.grid.cellSize).toBe(340);
    expect(layout.console).toMatchObject({ x: 392, y: 64, width: 236, height: 280 });
    expect(layout.grid.originX + layout.grid.width).toBeLessThan(layout.console.x);

    expect(layout.hpBars.player).toMatchObject({ x: 400, y: 92, width: 220 });
    expect(layout.hpBars.opponent).toMatchObject({ x: 400, y: 124, width: 220 });

    // Turn indicator check
    expect(layout.turnIndicator.x).toBe(510);
    expect(layout.turnIndicator.y).toBe(16);

    // Degradation policy check: objective and interaction hidden
    expect(layout.hud.objective.visible).toBe(false);
    expect(layout.hud.interaction.visible).toBe(false);
    expect(layout.hud.fontSize).toBe('9px');
    expect(layout.hud.entity.visible).toBe(true);
    expect(layout.hud.world.visible).toBe(true);
    expect(layout.hud.move.visible).toBe(true);
    expect(layout.exploration.hud.objective.width).toBe(208);
    expect(layout.exploration.hud.interaction.width).toBe(208);

  });

  it('does not introduce fractional combat scaling for larger viewports', () => {
    const layout = calculateCombatLayout(1280, 720);

    expect(layout.grid.cellSize).toBe(32);
    expect(layout.grid.originX).toBe(352);
    expect(Number.isInteger(layout.console.x)).toBe(true);
  });

  it('should be deterministic and return identical output for identical inputs', () => {
    const layout1 = calculateCombatLayout(800, 450);
    const layout2 = calculateCombatLayout(800, 450);
    expect(layout1).toEqual(layout2);
  });
});
