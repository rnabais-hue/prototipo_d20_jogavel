import Phaser from 'phaser';

const LEGEND_X = 16;
const LEGEND_Y = 72;
const LEGEND_WIDTH = 104;
const LEGEND_HEIGHT = 208;

export function drawDebugLegend(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0).setScrollFactor(0);
  const graphics = scene.add.graphics();
  container.add(graphics);

  graphics.fillStyle(0x10141b, 0.96);
  graphics.fillRect(LEGEND_X, LEGEND_Y, LEGEND_WIDTH, LEGEND_HEIGHT);
  graphics.lineStyle(1, 0x3c4c63, 1);
  graphics.strokeRect(LEGEND_X, LEGEND_Y, LEGEND_WIDTH, LEGEND_HEIGHT);

  const title = scene.add.text(LEGEND_X + 8, LEGEND_Y + 7, 'legend', {
    color: '#f4f0e8',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
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
  graphics.fillStyle(0x79d49c, 1);
  graphics.fillCircle(LEGEND_X + 16, y + 8, 7);
  graphics.lineStyle(2, 0xf4f0e8, 1);
  graphics.strokeCircle(LEGEND_X + 16, y + 8, 7);
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

  graphics.fillStyle(0x5a2b38, 1);
  graphics.fillRect(x, y, 16, 16);
  graphics.lineStyle(2, 0xff8a8a, 1);
  graphics.strokeRect(x + 2, y + 2, 12, 12);
  graphics.lineBetween(x + 3, y + 3, x + 13, y + 13);
  graphics.lineBetween(x + 13, y + 3, x + 3, y + 13);
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

  graphics.fillStyle(0x4fb3d9, 0.1);
  graphics.fillRect(x + 4, y + 4, 8, 8);
  graphics.lineStyle(1, 0x6ed8ff, 0.55);
  graphics.strokeRect(x + 4, y + 4, 8, 8);
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

  graphics.fillStyle(0xf2c14e, 0.18);
  graphics.fillRect(x, y, 16, 16);
  graphics.lineStyle(3, 0xffd166, 1);
  graphics.strokeRect(x, y, 16, 16);
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

  graphics.fillStyle(0x79d49c, 0.18);
  graphics.fillRect(x + 2, y + 2, 12, 12);
  graphics.lineStyle(2, 0x7ee2a8, 1);
  graphics.strokeRect(x + 2, y + 2, 12, 12);
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

  graphics.fillStyle(0xd8b4ff, 0.72);
  graphics.fillCircle(x, centerY, 4);
  graphics.lineStyle(2, 0xb983ff, 0.9);
  graphics.strokeCircle(x, centerY, 6);
  drawLegendLabel(scene, container, y, label);
}

function drawInterestLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  const centerX = LEGEND_X + 16;
  const centerY = y + 8;
  const radius = 5;

  graphics.fillStyle(0xf28f3b, 0.95);
  graphics.lineStyle(2, 0xffd6a5, 1);
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - radius);
  graphics.lineTo(centerX + radius, centerY);
  graphics.lineTo(centerX, centerY + radius);
  graphics.lineTo(centerX - radius, centerY);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  drawLegendLabel(scene, container, y, label);
}

function drawStatusLegendItem(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  container: Phaser.GameObjects.Container,
  y: number,
  label: string,
): void {
  graphics.fillStyle(0xf2c14e, 1);
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
