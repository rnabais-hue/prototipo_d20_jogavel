import Phaser from 'phaser';
import type { DebugCombatGridLayout } from '../debug/debugCombatGridProjection';
import type { GridCell } from '../../movement/grid';
import {
  COMBAT_VISUAL_COLORS,
  COMBAT_REACHABLE_CONFIG,
  COMBAT_ARENA_CONFIG,
} from './combatVisualConfig';

// Draw the combat grid lines over the arena ground.
export function drawCombatGridLines(
  graphics: Phaser.GameObjects.Graphics,
  layout: DebugCombatGridLayout,
  cols: number,
  rows: number,
): void {
  graphics.clear();
  const totalWidth = cols * layout.cellSize;
  const totalHeight = rows * layout.cellSize;

  graphics.lineStyle(1, COMBAT_VISUAL_COLORS.gridLine, COMBAT_ARENA_CONFIG.gridLineAlpha);

  for (let gx = 0; gx <= cols; gx += 1) {
    const wx = layout.originX + gx * layout.cellSize;
    graphics.lineBetween(wx, layout.originY, wx, layout.originY + totalHeight);
  }
  for (let gy = 0; gy <= rows; gy += 1) {
    const wy = layout.originY + gy * layout.cellSize;
    graphics.lineBetween(layout.originX, wy, layout.originX + totalWidth, wy);
  }
}

// Draw reachable movement cell overlays.
export function drawReachableCells(
  graphics: Phaser.GameObjects.Graphics,
  reachableCells: readonly GridCell[],
  layout: DebugCombatGridLayout,
): void {
  graphics.clear();
  if (reachableCells.length === 0) return;

  const inset = Math.max(3, layout.cellSize * COMBAT_REACHABLE_CONFIG.insetRatio);
  const size = layout.cellSize - inset * 2;

  graphics.fillStyle(COMBAT_VISUAL_COLORS.reachableFill, COMBAT_REACHABLE_CONFIG.fillAlpha);
  graphics.lineStyle(
    COMBAT_REACHABLE_CONFIG.strokeThickness,
    COMBAT_VISUAL_COLORS.reachableStroke,
    COMBAT_REACHABLE_CONFIG.strokeAlpha,
  );

  for (const cell of reachableCells) {
    const wx = layout.originX + cell.x * layout.cellSize + inset;
    const wy = layout.originY + cell.y * layout.cellSize + inset;
    graphics.fillRect(wx, wy, size, size);
    graphics.strokeRect(wx, wy, size, size);
  }
}
