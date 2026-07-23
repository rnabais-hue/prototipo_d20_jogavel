import Phaser from 'phaser';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';

const LEGEND_X = 16;
const LEGEND_Y = 72;
const LEGEND_WIDTH = 104;
const LEGEND_HEIGHT = 208;

export function drawExplorationLegend(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0).setScrollFactor(0);
  container.setDepth(EXPLORATION_DEPTHS.ui);
  
  const graphics = scene.add.graphics();
  container.add(graphics);

  // Background panel: flat dark charcoal with slate outline
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.charcoal, 0.96);
  graphics.fillRect(LEGEND_X, LEGEND_Y, LEGEND_WIDTH, LEGEND_HEIGHT);
  graphics.lineStyle(1.5, 0x3c4c63, 1);
  graphics.strokeRect(LEGEND_X, LEGEND_Y, LEGEND_WIDTH, LEGEND_HEIGHT);

  const title = scene.add.text(LEGEND_X + 8, LEGEND_Y + 7, 'legend', {
    color: '#f4f0e8',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
  });
  container.add(title);

  drawActorLegendItem(scene, graphics, container, LEGEND_Y + 30, 'actor');
  drawBlockedLegendItem(scene, graphics, container, LEGEND_Y + 52, 'blocked');
  drawRangeLegendItem(scene, graphics, container, LEGEND_Y + 74, 'reachable');
  drawSelectedLegendItem(scene, graphics, container, LEGEND_Y + 96, 'selected');
  drawTargetLegendItem(scene, graphics, container, LEGEND_Y + 118, 'target');
  drawPathLegendItem(scene, graphics, container, LEGEND_Y + 140, 'path');
  drawInterestLegendItem(scene, graphics, container, LEGEND_Y + 162, 'point');
  drawStatusLegendItem(scene, graphics, container, LEGEND_Y + 184, 'hud');

  return container;
}

function drawActorLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const cx = LEGEND_X + 16;
  const cy = y + 8;
  const r = 7;

  // Render miniature player token
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerBorder, 1);
  graphics.fillCircle(cx, cy, r);
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerFill, 1);
  graphics.fillCircle(cx, cy, r - 1.25);

  // Tiny shield emblem
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.playerEmblem, 1);
  graphics.beginPath();
  graphics.moveTo(cx - 2.5, cy - 3);
  graphics.lineTo(cx + 2.5, cy - 3);
  graphics.lineTo(cx + 2.5, cy);
  graphics.lineTo(cx, cy + 3);
  graphics.lineTo(cx - 2.5, cy);
  graphics.closePath();
  graphics.fillPath();

  drawLegendLabel(scene, container, y, label);
}

function drawBlockedLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const x = LEGEND_X + 8;

  // Render miniature beveled wall block
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.wallBase, 1);
  graphics.fillRect(x, y, 16, 16);

  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.wallMortar, 1);
  graphics.lineBetween(x, y + 8, x + 16, y + 8);
  graphics.lineBetween(x + 8, y, x + 8, y + 8);
  graphics.lineBetween(x + 4, y + 8, x + 4, y + 16);
  graphics.lineBetween(x + 12, y + 8, x + 12, y + 16);

  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.wallHighlight, 0.7);
  graphics.lineBetween(x + 1, y + 1, x + 7, y + 1);
  graphics.lineBetween(x + 1, y + 1, x + 1, y + 7);
  graphics.lineBetween(x + 9, y + 1, x + 15, y + 1);
  graphics.lineBetween(x + 9, y + 1, x + 9, y + 7);

  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.charcoal, 1);
  graphics.strokeRect(x, y, 16, 16);

  drawLegendLabel(scene, container, y, label);
}

function drawRangeLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const x = LEGEND_X + 8;

  // Reachable tile representation
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.reachableFill, 0.08);
  graphics.fillRect(x + 2, y + 2, 12, 12);
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.reachableStroke, 0.55);
  graphics.strokeRect(x + 2, y + 2, 12, 12);
  
  drawLegendLabel(scene, container, y, label);
}

function drawSelectedLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const x = LEGEND_X + 8;
  const size = 16;

  // Selected corner brackets representation
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.selectedFill, 0.08);
  graphics.fillRect(x, y, size, size);

  graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.selectedStroke, 1.0);
  const len = 4;
  // Brackets
  graphics.lineBetween(x, y, x + len, y);
  graphics.lineBetween(x, y, x, y + len);
  graphics.lineBetween(x + size, y, x + size - len, y);
  graphics.lineBetween(x + size, y, x + size, y + len);
  graphics.lineBetween(x, y + size, x + len, y + size);
  graphics.lineBetween(x, y + size, x, y + size - len);
  graphics.lineBetween(x + size, y + size, x + size - len, y + size);
  graphics.lineBetween(x + size, y + size, x + size, y + size - len);

  drawLegendLabel(scene, container, y, label);
}

function drawTargetLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const x = LEGEND_X + 8;
  const centerX = x + 8;
  const centerY = y + 8;

  // Target representation
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.targetFill, 0.08);
  graphics.fillRect(x + 2, y + 2, 12, 12);
  graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.targetStroke, 0.85);
  graphics.strokeRect(x + 2, y + 2, 12, 12);
  
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.targetStroke, 1.0);
  graphics.lineBetween(centerX - 4, centerY, centerX + 4, centerY);
  graphics.lineBetween(centerX, centerY - 4, centerX, centerY + 4);

  drawLegendLabel(scene, container, y, label);
}

function drawPathLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const x = LEGEND_X + 16;
  const centerY = y + 8;

  // Path preview node
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.pathFill, 0.85);
  graphics.fillCircle(x, centerY, 3);
  graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.pathStroke, 0.95);
  graphics.strokeCircle(x, centerY, 5);

  drawLegendLabel(scene, container, y, label);
}

function drawInterestLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const cx = LEGEND_X + 16;
  const cy = y + 8;

  // Render miniature survey scroll
  const paperColor = 0xf5ead0;
  const rollColor = EXPLORATION_VISUAL_COLORS.surveyFill;

  graphics.fillStyle(rollColor, 1);
  graphics.lineStyle(0.5, EXPLORATION_VISUAL_COLORS.surveyBorder, 1);
  graphics.fillRect(cx - 6, cy - 4, 1.8, 8);
  graphics.fillRect(cx + 4.2, cy - 4, 1.8, 8);

  graphics.fillStyle(paperColor, 1);
  graphics.fillRect(cx - 4.2, cy - 3.2, 8.4, 6.4);
  graphics.lineStyle(0.5, 0x8a6846, 0.5);
  graphics.strokeRect(cx - 4.2, cy - 3.2, 8.4, 6.4);

  drawLegendLabel(scene, container, y, label);
}

function drawStatusLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  // HUD status icon representation (amber bar/dots)
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.amber, 1);
  graphics.fillRect(LEGEND_X + 8, y + 5, 16, 3);
  graphics.fillRect(LEGEND_X + 8, y + 11, 10, 3);
  
  drawLegendLabel(scene, container, y, label);
}

function drawLegendLabel(scene: Phaser.Scene, container: Phaser.GameObjects.Container, y: number, label: string): void {
  const text = scene.add.text(LEGEND_X + 31, y + 1, label, {
    color: '#c8d3df',
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
  });
  container.add(text);
}
