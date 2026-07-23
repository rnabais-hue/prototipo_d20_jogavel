import { describe, it, expect } from 'vitest';
import { calculateCombatLayout } from './combatLayoutHelper';

describe('combatLayoutHelper', () => {
  it('should compute valid layout for standard viewport (800x450)', () => {
    const layout = calculateCombatLayout(800, 450);

    // Grid checks
    expect(layout.grid.cols).toBe(10);
    expect(layout.grid.rows).toBe(8);
    expect(layout.grid.originY).toBe(92);
    expect(layout.grid.cellSize).toBeLessThanOrEqual(42);

    // Console checks
    expect(layout.console.width).toBeLessThanOrEqual(560);
    expect(layout.console.height).toBe(144);
    expect(layout.console.y).toBe(450 - 144 - 24); // 282

    // Gap check: grid bottom must be at least 12px above console top
    const gridBottom = layout.grid.originY + layout.grid.height;
    expect(gridBottom + 12).toBeLessThanOrEqual(layout.console.y);
    expect(layout.console.y - gridBottom).toBe(12); // Grid height is 178, gap is 282 - 270 = 12px
    expect(layout.grid.cellSize).toBe(22.25);

    expect(layout.exploration.hud.objective.width).toBe(232);
    expect(layout.exploration.hud.interaction.width).toBe(232);
    expect(layout.exploration.hud.paddingX).toBe(4);
    expect(layout.exploration.hud.paddingY).toBe(3);

    // HP Bars check
    expect(layout.hpBars.player.width).toBe(200);
    expect(layout.hpBars.player.x).toBe(16);
    expect(layout.hpBars.opponent.x).toBe(800 - 16 - 200); // 584

    // Turn indicator check
    expect(layout.turnIndicator.x).toBe(400);
    expect(layout.turnIndicator.y).toBe(48);

    // Debug diagnostics checks (no degradation for standard size)
    expect(layout.hud.objective.visible).toBe(true);
    expect(layout.hud.interaction.visible).toBe(true);
    expect(layout.hud.fontSize).toBe('11px');

    // No overlap check: left diagnostics (entity/world) end before grid starts
    const leftHudEnd = layout.hud.entity.x + layout.hud.entity.width;
    expect(leftHudEnd).toBeLessThanOrEqual(layout.grid.originX);

    // No overlap check: right diagnostics (objective/interaction/move) start after grid ends
    const gridEnd = layout.grid.originX + layout.grid.width;
    expect(layout.hud.move.x - layout.hud.move.width).toBeGreaterThanOrEqual(gridEnd);

    // No vertical overlap with console: left diagnostics (entity/world) end before consoleY
    // entity starts at 72. height is 4 lines * 13 + 8 = 60px. Ends at 132.
    // world starts at 132 + 8 = 140. height is 6 lines * 13 + 8 = 86px. Ends at 226.
    // 226 < 282 consoleY.
    const leftDiagnosticsHeight = 72 + (4 * 13 + 8) + 8 + (6 * 13 + 8);
    expect(leftDiagnosticsHeight).toBeLessThan(layout.console.y);
  });

  it('should compute valid layout for smaller viewport (640x360)', () => {
    const layout = calculateCombatLayout(640, 360);

    const gridBottom = layout.grid.originY + layout.grid.height;
    expect(gridBottom + 8).toBeLessThanOrEqual(layout.console.y); // small height uses 8px gap
    expect(layout.grid.cellSize).toBeLessThan(22);

    // HP Bars check (width should scale down to 150)
    expect(layout.hpBars.player.width).toBe(150);
    expect(layout.hpBars.player.x).toBe(12);
    expect(layout.hpBars.opponent.width).toBe(150);
    expect(layout.hpBars.opponent.x).toBe(640 - 12 - 150); // 478

    // Turn indicator check
    expect(layout.turnIndicator.x).toBe(320);
    expect(layout.turnIndicator.y).toBe(42);

    // Degradation policy check: objective and interaction hidden
    expect(layout.hud.objective.visible).toBe(false);
    expect(layout.hud.interaction.visible).toBe(false);
    expect(layout.hud.fontSize).toBe('9px');
    expect(layout.hud.entity.visible).toBe(true);
    expect(layout.hud.world.visible).toBe(true);
    expect(layout.hud.move.visible).toBe(true);
    expect(layout.exploration.hud.objective.width).toBe(208);
    expect(layout.exploration.hud.interaction.width).toBe(208);

    // Left diagnostics height check under degradation (fontSize 9px)
    // entityStarts at 60. height: 4 lines * 10 + 6 = 46. Ends at 106.
    // worldY = 106 + 4 = 110. Height is 6 lines * 10 + 6 = 66. Ends at 176.
    // consoleY is 360 - 144 - 12 = 204.
    // 176 < 204.
    const leftDiagnosticsHeight = 60 + (4 * 10 + 6) + 4 + (6 * 10 + 6);
    expect(leftDiagnosticsHeight).toBeLessThan(layout.console.y);
  });

  it('should cap cellSize to 42 for large viewports (1280x720)', () => {
    const layout = calculateCombatLayout(1280, 720);

    expect(layout.grid.cellSize).toBe(42);
    const gridBottom = layout.grid.originY + layout.grid.height;
    expect(gridBottom + 12).toBeLessThanOrEqual(layout.console.y);
  });

  it('should be deterministic and return identical output for identical inputs', () => {
    const layout1 = calculateCombatLayout(800, 450);
    const layout2 = calculateCombatLayout(800, 450);
    expect(layout1).toEqual(layout2);
  });
});
