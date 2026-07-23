import Phaser from 'phaser';
import type { InterestPoint } from '../../exploration/interestPoint';
import { gridToWorld } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from '../debug/debugExplorationConfig';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getExitPortalVisualState, type ExitPortalVisualState } from './exitPortalState';

export type ExplorationInterestPointsView = Phaser.GameObjects.Graphics | Phaser.GameObjects.Container;

function getPointAssetKey(kind: InterestPoint['kind']) {
  switch (kind) {
    case 'survey': return VISUAL_ASSET_KEYS.surveyPoint;
    case 'switch': return VISUAL_ASSET_KEYS.switchPoint;
    case 'exit_marker': return VISUAL_ASSET_KEYS.exitPoint;
    case 'combat_trigger': return VISUAL_ASSET_KEYS.encounterPoint;
  }
}

export function createExplorationInterestPointsView(
  scene: Phaser.Scene,
  points: readonly InterestPoint[],
): ExplorationInterestPointsView {
  const hasTexture = points.some(p => {
    const assetKey = getPointAssetKey(p.kind);
    const entry = getVisualAssetEntry(assetKey);
    const resolution = resolveVisualAsset(entry, (k) => scene.textures.exists(k));
    return resolution.mode === 'texture';
  });

  if (hasTexture) {
    const container = scene.add.container(0, 0);
    container.setDepth(EXPLORATION_DEPTHS.pointsOfInterest);
    return container;
  } else {
    const graphics = scene.add.graphics();
    graphics.setDepth(EXPLORATION_DEPTHS.pointsOfInterest);
    return graphics;
  }
}

export function drawExplorationInterestPoints(
  view: ExplorationInterestPointsView,
  points: readonly InterestPoint[],
): void {
  if (view instanceof Phaser.GameObjects.Container) {
    rebuildInterestPointsContainer(view, points);
  } else {
    redrawInterestPointsGraphics(view, points);
  }
}

function rebuildInterestPointsContainer(
  container: Phaser.GameObjects.Container,
  points: readonly InterestPoint[],
): void {
  container.removeAll(true);
  const scene = container.scene;

  for (const point of points) {
    const center = gridToWorld(point.cell, DEBUG_EXPLORATION_GRID.cellSize);
    const x = DEBUG_EXPLORATION_GRID.originX + center.x;
    const y = DEBUG_EXPLORATION_GRID.originY + center.y;
    const radius = DEBUG_EXPLORATION_GRID.cellSize * 0.18; // ~6px
    const isInspected = point.state === 'inspected';

    const assetKey = getPointAssetKey(point.kind);
    const entry = getVisualAssetEntry(assetKey);
    const resolution = resolveVisualAsset(entry, (k) => scene.textures.exists(k));

    if (resolution.mode === 'texture') {
      const sprite = scene.add.sprite(x, y, entry.key);
      sprite.setOrigin(entry.anchor.x, entry.anchor.y);
      sprite.setDisplaySize(entry.logicalWidth, entry.logicalHeight);
      
      if (point.kind === 'switch' && entry.resourceKind === 'spritesheet') {
        const isActive = point.debugFlagActive ?? false;
        sprite.setFrame(isActive ? 1 : 0);
      } else if (point.kind === 'exit_marker' && entry.resourceKind === 'spritesheet') {
        const visualState = getExitPortalVisualState(point, points);
        const frameMap: Record<ExitPortalVisualState, number> = {
          locked: 0,
          available: 1,
          completed: 2,
        };
        sprite.setFrame(frameMap[visualState] ?? 0);
      }

      container.add(sprite);

      if (point.kind === 'exit_marker' && isInspected) {
        const overlayGraphics = scene.add.graphics();
        drawCompletedExitMarkerOverlay(overlayGraphics, x, y, radius);
        container.add(overlayGraphics);
      }
    } else {
      const fallbackGraphics = scene.add.graphics();
      drawSingleInterestPointGraphic(fallbackGraphics, point, points);
      container.add(fallbackGraphics);
    }
  }
}

function redrawInterestPointsGraphics(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly InterestPoint[],
): void {
  graphics.clear();
  for (const point of points) {
    drawSingleInterestPointGraphic(graphics, point, points);
  }
}

function drawSingleInterestPointGraphic(
  graphics: Phaser.GameObjects.Graphics,
  point: InterestPoint,
  allPoints: readonly InterestPoint[],
): void {
  const center = gridToWorld(point.cell, DEBUG_EXPLORATION_GRID.cellSize);
  const x = DEBUG_EXPLORATION_GRID.originX + center.x;
  const y = DEBUG_EXPLORATION_GRID.originY + center.y;
  const radius = DEBUG_EXPLORATION_GRID.cellSize * 0.18; // ~6px
  const isInspected = point.state === 'inspected';
  const alpha = isInspected ? 0.45 : 1.0;

  switch (point.kind) {
    case 'survey':
      drawSurveyScroll(graphics, x, y, radius, alpha, isInspected);
      break;

    case 'switch':
      drawLeverSwitch(graphics, x, y, radius, alpha, point.debugFlagActive ?? false, isInspected);
      break;

    case 'exit_marker': {
      const visualState = getExitPortalVisualState(point, allPoints);
      drawExitPortal(graphics, x, y, radius, alpha, visualState);
      break;
    }

    case 'combat_trigger':
      drawCrossedSwords(graphics, x, y, radius, alpha, isInspected);
      break;
  }
}

function drawSurveyScroll(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  isInspected: boolean,
): void {
  const paperColor = 0xf5ead0;
  const rollColor = EXPLORATION_VISUAL_COLORS.surveyFill;

  graphics.fillStyle(rollColor, alpha);
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.surveyBorder, alpha);
  graphics.fillRect(x - 9, y - 6, 2.5, 12);
  graphics.strokeRect(x - 9, y - 6, 2.5, 12);
  graphics.fillRect(x + 6.5, y - 6, 2.5, 12);
  graphics.strokeRect(x + 6.5, y - 6, 2.5, 12);

  graphics.fillStyle(paperColor, alpha);
  graphics.fillRect(x - 6.5, y - 5, 13, 10);
  graphics.lineStyle(1, 0x8a6846, alpha * 0.5);
  graphics.strokeRect(x - 6.5, y - 5, 13, 10);

  graphics.lineStyle(1, 0x8a6846, alpha * 0.6);
  graphics.lineBetween(x - 4, y - 2, x + 4, y - 2);
  graphics.lineBetween(x - 4, y + 1, x + 2, y + 1);

  if (isInspected) {
    graphics.lineStyle(2, 0x65c98c, 0.9);
    graphics.beginPath();
    graphics.moveTo(x - 3, y);
    graphics.lineTo(x - 1, y + 2);
    graphics.lineTo(x + 3, y - 2);
    graphics.strokePath();
  }
}

function drawLeverSwitch(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  isActive: boolean,
  isInspected: boolean,
): void {
  graphics.fillStyle(0x283548, alpha);
  graphics.lineStyle(1, 0x3c4c63, alpha);
  graphics.fillRect(x - 8, y - 8, 16, 16);
  graphics.strokeRect(x - 8, y - 8, 16, 16);

  graphics.fillStyle(0x15181f, alpha);
  graphics.fillRect(x - 4, y - 4, 8, 8);

  if (isActive) {
    graphics.fillStyle(EXPLORATION_VISUAL_COLORS.switchActiveFill, 0.25);
    graphics.fillCircle(x, y, 13);
    graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.switchActiveFill, 0.45);
    graphics.strokeCircle(x, y, 13);
  }

  const leverColor = isActive ? EXPLORATION_VISUAL_COLORS.switchActiveFill : EXPLORATION_VISUAL_COLORS.switchInactiveFill;
  graphics.lineStyle(2.5, leverColor, alpha);

  if (isActive) {
    graphics.lineBetween(x - 2, y + 3, x + 6, y - 5);
    graphics.fillStyle(EXPLORATION_VISUAL_COLORS.switchActiveFill, alpha);
    graphics.fillCircle(x + 6, y - 5, 2.5);
  } else {
    graphics.lineBetween(x + 2, y + 3, x - 6, y - 5);
    graphics.fillStyle(0x7b8491, alpha);
    graphics.fillCircle(x - 6, y - 5, 2.5);
  }
}

function drawExitPortal(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  visualState: ExitPortalVisualState,
): void {
  const portalRadius = radius * 1.1;

  // Draw stone archway columns (left & right)
  graphics.fillStyle(0x4c5968, alpha);
  graphics.lineStyle(1, 0x6b7c91, alpha);
  graphics.fillRect(x - 9, y - 9, 3, 18);
  graphics.strokeRect(x - 9, y - 9, 3, 18);
  graphics.fillRect(x + 6, y - 9, 3, 18);
  graphics.strokeRect(x + 6, y - 9, 3, 18);

  // Top arch cap
  graphics.fillStyle(0x4c5968, alpha);
  graphics.fillRect(x - 9, y - 11, 18, 3);
  graphics.strokeRect(x - 9, y - 11, 18, 3);

  if (visualState === 'completed') {
    // Completed portal glows purple
    graphics.fillStyle(EXPLORATION_VISUAL_COLORS.exitFill, alpha);
    graphics.fillCircle(x, y, portalRadius);

    graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.exitBorder, alpha);
    graphics.strokeCircle(x, y, portalRadius * 0.7);
    graphics.strokeCircle(x, y, portalRadius * 0.35);

    // Draw victory overlay checkmark
    drawCompletedExitMarkerOverlay(graphics, x, y, radius);
  } else if (visualState === 'available') {
    // Swirling portal interior indicating it is active and ready (no padlock!)
    graphics.fillStyle(0x3d2752, alpha); // Muted purple glow
    graphics.fillCircle(x, y, portalRadius);
    graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.exitBorder, alpha * 0.75);
    graphics.strokeCircle(x, y, portalRadius);
    graphics.strokeCircle(x, y, portalRadius * 0.6);
  } else {
    // Locked portal: dark purple, padlock icon
    graphics.fillStyle(0x1a1525, alpha);
    graphics.fillCircle(x, y, portalRadius);
    graphics.lineStyle(1.5, 0x5a3f7a, alpha);
    graphics.strokeCircle(x, y, portalRadius);
    graphics.strokeCircle(x, y, portalRadius * 0.5);

    // Draw red padlock symbol
    graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.dangerCoral, alpha);
    graphics.strokeRect(x - 3, y - 1, 6, 5);
    graphics.beginPath();
    graphics.arc(x, y - 1, 2, Math.PI, 0);
    graphics.strokePath();
  }
}

function drawCompletedExitMarkerOverlay(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
): void {
  graphics.lineStyle(2, 0xf7f0a1, 1);
  graphics.strokeCircle(x, y, radius * 1.55);

  graphics.fillStyle(0xf7f0a1, 1);
  graphics.fillCircle(x, y, radius * 0.28);

  graphics.lineStyle(3, 0xf7f0a1, 1);
  graphics.beginPath();
  graphics.moveTo(x - radius * 0.6, y + radius * 0.1);
  graphics.lineTo(x - radius * 0.15, y + radius * 0.5);
  graphics.lineTo(x + radius * 0.65, y - radius * 0.4);
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

function drawCrossedSwords(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  isInspected: boolean,
): void {
  const auraColor = EXPLORATION_VISUAL_COLORS.combatTriggerFill;
  graphics.fillStyle(auraColor, alpha * 0.18);
  graphics.fillCircle(x, y, 10);
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.combatTriggerBorder, alpha * 0.45);
  graphics.strokeCircle(x, y, 10);

  const bladeColor = isInspected ? 0x7b8491 : 0xf4f0e8;
  const hiltColor = isInspected ? 0x5a2b38 : auraColor;

  graphics.lineStyle(1.5, bladeColor, alpha);

  graphics.lineBetween(x - 6, y - 6, x + 6, y + 6);
  graphics.lineBetween(x - 4, y - 2, x - 2, y - 4);
  graphics.fillStyle(hiltColor, alpha);
  graphics.fillCircle(x - 6, y - 6, 1.5);

  graphics.lineBetween(x + 6, y - 6, x - 6, y + 6);
  graphics.lineBetween(x + 4, y - 2, x + 2, y - 4);
  graphics.fillStyle(hiltColor, alpha);
  graphics.fillCircle(x + 6, y - 6, 1.5);

  if (isInspected) {
    graphics.lineStyle(1.5, 0x5d6a7d, 0.85);
    graphics.lineBetween(x - 8, y + 2, x + 8, y - 2);
  }
}
