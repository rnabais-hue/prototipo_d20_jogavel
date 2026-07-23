export type VisualAnchor = Readonly<{ x: number; y: number }>;

export type VisualScaleConfig = Readonly<{
  explorationTileSize: number;
  combatCellMaximum: number;
  actorCellWidthRatio: number;
  actorAnchor: VisualAnchor;
  pointOfInterestCellWidthRatio: number;
  effectCellWidthRatio: number;
  uiIconSize: number;
  uiPanelBorderSize: number;
  uiPanelPadding: number;
}>;

export const VISUAL_SCALE: VisualScaleConfig = Object.freeze({
  explorationTileSize: 32,
  combatCellMaximum: 42,
  actorCellWidthRatio: 0.8,
  actorAnchor: Object.freeze({ x: 0.5, y: 0.82 }),
  pointOfInterestCellWidthRatio: 0.56,
  effectCellWidthRatio: 1,
  uiIconSize: 16,
  uiPanelBorderSize: 2,
  uiPanelPadding: 8,
});

export function scaleToCell(cellSize: number, ratio: number): number {
  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new RangeError('cellSize must be a positive finite number');
  }
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new RangeError('ratio must be a positive finite number');
  }
  return cellSize * ratio;
}
