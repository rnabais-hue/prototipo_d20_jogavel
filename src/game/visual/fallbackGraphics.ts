import Phaser from 'phaser';
import type { VisualAssetCatalogEntry } from './assetCatalog';

export function createVisualFallback(
  scene: Phaser.Scene,
  entry: VisualAssetCatalogEntry,
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();
  const width = entry.logicalWidth;
  const height = entry.logicalHeight;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const palette = fallbackPalette(entry.fallback);
  graphics.fillStyle(palette.fill, 1).fillRect(-halfWidth, -halfHeight, width, height);
  graphics.lineStyle(2, palette.stroke, 1).strokeRect(-halfWidth, -halfHeight, width, height);
  container.add(graphics);
  const label = scene.add.text(0, 0, fallbackLabel(entry.fallback), {
    color: '#f4f0e8', fontFamily: 'Arial, sans-serif', fontSize: `${Math.max(8, Math.min(12, height * 0.4))}px`, fontStyle: 'bold',
  }).setOrigin(0.5);
  container.add(label);
  container.setData('visualAssetKey', entry.key);
  container.setData('visualFallback', true);
  return container;
}

function fallbackPalette(kind: VisualAssetCatalogEntry['fallback']): { fill: number; stroke: number } {
  switch (kind) {
    case 'player': return { fill: 0x65c98c, stroke: 0xc4f4d5 };
    case 'enemy': return { fill: 0xe85d5d, stroke: 0xffc1b9 };
    case 'survey': return { fill: 0xf28f3b, stroke: 0xffd6a5 };
    case 'switch': return { fill: 0x5fb0b7, stroke: 0xb7f0f5 };
    case 'exit': return { fill: 0xb983ff, stroke: 0xe7c8ff };
    case 'encounter': return { fill: 0xe63946, stroke: 0xffb7b2 };
    case 'obstacle': return { fill: 0x5a2b38, stroke: 0xff8a8a };
    case 'effect': return { fill: 0xff6b4a, stroke: 0xffd166 };
    case 'icon': return { fill: 0x4c5968, stroke: 0xf2c14e };
    case 'panel': return { fill: 0x10141b, stroke: 0x3c4c63 };
    case 'terrain': return { fill: 0x283548, stroke: 0x4c5968 };
  }
}

function fallbackLabel(kind: VisualAssetCatalogEntry['fallback']): string {
  switch (kind) {
    case 'player': return 'P';
    case 'enemy': return 'E';
    case 'survey': return '?';
    case 'switch': return 'S';
    case 'exit': return 'X';
    case 'encounter': return '!';
    case 'obstacle': return '#';
    case 'effect': return '*';
    case 'icon': return 'A';
    case 'panel': return '';
    case 'terrain': return '';
  }
}
