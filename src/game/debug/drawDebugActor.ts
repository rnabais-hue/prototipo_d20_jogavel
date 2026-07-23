import Phaser from 'phaser';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export type DebugActorView = {
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
};

function formatActorLabel(label: string, cell: GridCell): string {
  return `${label}: ${cell.x},${cell.y}`;
}

export function drawDebugActor(
  scene: Phaser.Scene,
  labelText: string,
  cell: GridCell,
): DebugActorView {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const actorX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const actorY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;
  const actorRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.28;

  const graphics = scene.add.graphics();
  graphics.setPosition(actorX, actorY);
  graphics.fillStyle(0x79d49c, 1);
  graphics.fillCircle(0, 0, actorRadius);
  graphics.lineStyle(2, 0xf4f0e8, 1);
  graphics.strokeCircle(0, 0, actorRadius);

  const label = scene.add
    .text(actorX, actorY + actorRadius + 5, formatActorLabel(labelText, cell), {
      color: '#9fd8b5',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
    })
    .setOrigin(0.5, 0);

  return { graphics, label };
}

export function setDebugActorPosition(
  actorView: DebugActorView,
  labelText: string,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const actorX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const actorY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;
  const actorRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.28;

  actorView.graphics.setPosition(actorX, actorY);
  actorView.label.setPosition(actorX, actorY + actorRadius + 5);
  actorView.label.setText(formatActorLabel(labelText, cell));
}

export function destroyDebugActor(actorView: DebugActorView): void {
  actorView.graphics.destroy();
  actorView.label.destroy();
}
