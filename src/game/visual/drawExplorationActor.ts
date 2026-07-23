import Phaser from 'phaser';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from '../debug/debugExplorationConfig';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getPresentationMode } from './presentationState';
import { playActorAnimation, type ActorAnimationState } from './actorAnimations';

export type ExplorationActorVisual = Phaser.GameObjects.Graphics | Phaser.GameObjects.Container;

export type ExplorationActorView = {
  graphics: ExplorationActorVisual;
  label: Phaser.GameObjects.Text;
  sprite?: Phaser.GameObjects.Sprite;
};

function formatActorLabel(label: string, cell: GridCell): string {
  const mode = getPresentationMode();
  return mode === 'debug' ? `${label}: ${cell.x},${cell.y}` : label;
}


export function drawExplorationActor(
  scene: Phaser.Scene,
  labelText: string,
  cell: GridCell,
): ExplorationActorView {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const actorX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const actorY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;
  const actorRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.28; // ~9px

  const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor);
  const resolution = resolveVisualAsset(entry, (key) => scene.textures.exists(key));

  let graphics: ExplorationActorVisual;
  let actorSprite: Phaser.GameObjects.Sprite | undefined;

  if (resolution.mode === 'texture') {
    const sprite = scene.add.sprite(0, 0, entry.key);
    sprite.setOrigin(entry.anchor.x, entry.anchor.y);
    sprite.setDisplaySize(entry.logicalWidth, entry.logicalHeight);
    playActorAnimation(scene, sprite, 'player', 'idle');

    const container = scene.add.container(actorX, actorY);
    container.add(sprite);
    container.setDepth(EXPLORATION_DEPTHS.actors);
    
    graphics = container;
    actorSprite = sprite;
  } else {
    const rawGraphics = scene.add.graphics();
    rawGraphics.setDepth(EXPLORATION_DEPTHS.actors);
    rawGraphics.setPosition(actorX, actorY);
    drawPlayerTokenGraphics(rawGraphics, actorRadius);
    graphics = rawGraphics;
  }

  const label = scene.add
    .text(actorX, actorY + actorRadius + 5, formatActorLabel(labelText, cell), {
      color: '#c5e2d0',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      shadow: { color: '#10141b', fill: true, offsetX: 1, offsetY: 1, blur: 2 }
    })
    .setOrigin(0.5, 0)
    .setDepth(EXPLORATION_DEPTHS.actors + 1);

  return { graphics, label, sprite: actorSprite };
}

export function playExplorationActorAnimation(
  scene: Phaser.Scene,
  actorView: ExplorationActorView,
  state: Extract<ActorAnimationState, 'idle' | 'movement'>,
): void {
  playActorAnimation(scene, actorView.sprite, 'player', state);
}

export function setExplorationActorPosition(
  actorView: ExplorationActorView,
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

export function destroyExplorationActor(actorView: ExplorationActorView): void {
  actorView.graphics.destroy();
  actorView.label.destroy();
}

function drawPlayerTokenGraphics(graphics: Phaser.GameObjects.Graphics, radius: number): void {
  graphics.clear();

  // 1. Drop shadow (slightly offset down-right, black with alpha)
  graphics.fillStyle(0x000000, 0.4);
  graphics.fillCircle(2, 2, radius);

  // 2. Token outer ring border (Bronze/Gold)
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerBorder, 1);
  graphics.fillCircle(0, 0, radius);

  // 3. Token inner fill (Adventurous green)
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerFill, 1);
  graphics.fillCircle(0, 0, radius - 1.5);

  // 4. Token emblem: shield silhouette in ivory
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerEmblem, 1);
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.playerBorder, 0.5);
  graphics.beginPath();
  const topY = -4;
  const midY = 0;
  const botY = 4;
  const halfW = 3.5;
  graphics.moveTo(-halfW, topY);
  graphics.lineTo(halfW, topY);
  graphics.lineTo(halfW, midY);
  graphics.lineTo(0, botY);
  graphics.lineTo(-halfW, midY);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  graphics.lineStyle(1, 0xffffff, 0.25);
  graphics.strokeCircle(0, 0, radius - 0.75);
}
