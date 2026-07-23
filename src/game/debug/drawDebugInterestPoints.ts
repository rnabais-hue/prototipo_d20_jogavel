import Phaser from 'phaser';
import type { InterestPoint } from '../../exploration/interestPoint';
import { gridToWorld } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export function drawDebugInterestPoints(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly InterestPoint[],
): void {
  graphics.clear();

  for (const point of points) {
    drawInterestPoint(graphics, point);
  }
}

function drawInterestPoint(
  graphics: Phaser.GameObjects.Graphics,
  point: InterestPoint,
): void {
  const center = gridToWorld(point.cell, DEBUG_EXPLORATION_GRID.cellSize);
  const x = DEBUG_EXPLORATION_GRID.originX + center.x;
  const y = DEBUG_EXPLORATION_GRID.originY + center.y;
  const radius = DEBUG_EXPLORATION_GRID.cellSize * 0.18;
  const palette = getInterestPointPalette(point);

  graphics.fillStyle(palette.fillColor, 0.95);
  graphics.lineStyle(2, palette.strokeColor, 1);
  graphics.beginPath();

  switch (point.kind) {
    case 'survey':
      graphics.moveTo(x, y - radius);
      graphics.lineTo(x + radius, y);
      graphics.lineTo(x, y + radius);
      graphics.lineTo(x - radius, y);
      break;
    case 'switch':
      graphics.moveTo(x - radius, y - radius);
      graphics.lineTo(x + radius, y - radius);
      graphics.lineTo(x + radius, y + radius);
      graphics.lineTo(x - radius, y + radius);
      break;
    case 'exit_marker':
      graphics.arc(x, y, radius, 0, Math.PI * 2);
      break;
    case 'combat_trigger':
      graphics.moveTo(x, y - radius);
      graphics.lineTo(x + radius, y + radius);
      graphics.lineTo(x - radius, y + radius);
      break;
  }

  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  if (point.kind === 'exit_marker' && point.state === 'inspected') {
    drawCompletedExitMarkerOverlay(graphics, x, y, radius);
  } else if (point.state === 'inspected') {
    graphics.lineBetween(x - radius * 0.6, y - radius * 0.6, x + radius * 0.6, y + radius * 0.6);
    graphics.lineBetween(x + radius * 0.6, y - radius * 0.6, x - radius * 0.6, y + radius * 0.6);
  }

  if (point.kind === 'switch' && point.debugFlagActive) {
    graphics.lineStyle(3, 0xe9ff70, 1);
    graphics.lineBetween(x - radius * 0.5, y, x + radius * 0.5, y);
  }
}

function drawCompletedExitMarkerOverlay(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
): void {
  graphics.lineStyle(3, 0xf7f0a1, 1);
  graphics.strokeCircle(x, y, radius * 1.4);

  graphics.fillStyle(0xf7f0a1, 1);
  graphics.fillCircle(x, y, radius * 0.28);

  graphics.lineStyle(4, 0xf7f0a1, 1);
  graphics.beginPath();
  graphics.moveTo(x - radius * 0.55, y + radius * 0.05);
  graphics.lineTo(x - radius * 0.15, y + radius * 0.45);
  graphics.lineTo(x + radius * 0.6, y - radius * 0.4);
  graphics.strokePath();

  graphics.lineStyle(2, 0xf7f0a1, 1);
  graphics.strokeRect(
    x - radius * 1.15,
    y - radius * 1.95,
    radius * 2.3,
    radius * 0.7,
  );
  graphics.lineBetween(x - radius * 0.6, y - radius * 1.6, x - radius * 0.2, y - radius * 1.25);
  graphics.lineBetween(x - radius * 0.2, y - radius * 1.25, x + radius * 0.6, y - radius * 1.6);
}

function getInterestPointPalette(point: InterestPoint): { fillColor: number; strokeColor: number } {
  if (point.state === 'inspected') {
    return {
      fillColor: point.kind === 'switch' && point.debugFlagActive ? 0x688f2b : 0x5d6a7d,
      strokeColor: point.kind === 'switch' && point.debugFlagActive ? 0xe9ff70 : 0xc8d3df,
    };
  }

  switch (point.kind) {
    case 'survey':
      return { fillColor: 0xf28f3b, strokeColor: 0xffd6a5 };
    case 'switch':
      return { fillColor: 0x5fb0b7, strokeColor: 0xb7f0f5 };
    case 'exit_marker':
      return { fillColor: 0xc46bfa, strokeColor: 0xe7c8ff };
    case 'combat_trigger':
      return { fillColor: 0xe63946, strokeColor: 0xffb7b2 };
  }
}
