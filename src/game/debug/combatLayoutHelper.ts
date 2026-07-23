export interface HudBlockLayout {
  x: number;
  y: number;
  width: number;
  visible: boolean;
  originX: number;
}

export interface CombatLayout {
  grid: {
    originX: number;
    originY: number;
    cellSize: number;
    width: number;
    height: number;
    cols: number;
    rows: number;
  };
  console: {
    x: number;
    y: number;
    width: number;
    height: number;
    historyX: number;
    historyY: number;
    promptsX: number;
    promptsNormalY: number;
    promptsAttacksY: number;
  };
  hpBars: {
    player: { x: number; y: number; width: number; height: number };
    opponent: { x: number; y: number; width: number; height: number };
  };
  turnIndicator: {
    x: number;
    y: number;
  };
  hud: {
    objective: HudBlockLayout;
    interaction: HudBlockLayout;
    entity: HudBlockLayout;
    world: HudBlockLayout;
    move: HudBlockLayout;
    fontSize: string;
    paddingX: number;
    paddingY: number;
    lineSpacing: number;
  };
  exploration: {
    legend: { x: number; y: number; width: number; height: number };
    hud: {
      objective: HudBlockLayout;
      interaction: HudBlockLayout;
      entity: HudBlockLayout;
      world: HudBlockLayout;
      move: HudBlockLayout;
      fontSize: string;
      paddingX: number;
      paddingY: number;
      lineSpacing: number;
    };
    placeholderText: { x: number; y: number };
  };
}

/**
 * Pure layout helper that calculates positions and dimensions for the combat grid,
 * combat console panel, HP bars, turn indicator, diagnostics overlays, and exploration
 * elements from the current viewport dimensions.
 *
 * It ensures that:
 * 1. The combat grid ends above the console panel with a visible gap (min 12px / 8px).
 * 2. All text layouts, diagnostic boxes, and HUD components remain fully readable.
 * 3. Incorporates a deterministic degradation strategy for debug mode at smaller heights.
 */
export function calculateCombatLayout(width: number, height: number): CombatLayout {
  const cols = 10;
  const rows = 8;
  const isSmallHeight = height < 420;
  const padding = width < 700 ? 12 : 16;

  // HP Bars:
  const barWidth = width < 700 ? 150 : 200;
  const barHeight = 12;
  const hpBarY = isSmallHeight ? 24 : 28;

  // Turn Indicator:
  const turnY = isSmallHeight ? 42 : 48;

  // Console panel geometry
  const consoleWidth = Math.min(560, width - 2 * padding);
  const consoleX = (width - consoleWidth) / 2;
  const consoleHeight = 144;
  const consoleMarginBottom = isSmallHeight ? 12 : 24;
  const consoleY = height - consoleHeight - consoleMarginBottom;

  // Grid
  const originY = isSmallHeight ? 80 : 92;
  const gridConsoleGap = isSmallHeight ? 8 : 12;
  
  const maxCellSizeX = (width - 2 * padding) / cols;
  const availableHeight = consoleY - gridConsoleGap - originY;
  const maxCellSizeY = availableHeight / rows;
  const cellSize = Math.max(8, Math.min(42, maxCellSizeX, maxCellSizeY));

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;
  const originX = (width - gridWidth) / 2;

  // Console offsets
  const historyX = consoleX + 8;
  const historyY = consoleY + 6;
  const promptsX = consoleX + 8;
  const promptsNormalY = consoleY + consoleHeight - 18;
  const promptsAttacksY = consoleY + consoleHeight - 68;

  // --- Combat HUD Diagnostics Placement & Degradation Policy ---
  let hudFontSize = '11px';
  let hudPaddingX = 6;
  let hudPaddingY = 4;
  let hudLineSpacing = 2;
  let hudWidth = Math.max(150, Math.min(240, originX - padding - 12));

  let entityY = isSmallHeight ? 60 : 72;
  let entityHeight = 4 * 13 + 2 * hudPaddingY; // 4 lines
  let worldY = entityY + entityHeight + (isSmallHeight ? 6 : 8);

  let objectiveY = isSmallHeight ? 60 : 72;
  let objectiveHeight = 4 * 13 + 2 * hudPaddingY; // 4 lines
  let interactionY = objectiveY + objectiveHeight + (isSmallHeight ? 6 : 8);
  let interactionHeight = 3 * 13 + 2 * hudPaddingY; // 3 lines
  let moveY = interactionY + interactionHeight + (isSmallHeight ? 6 : 8);

  let objectiveVisible = true;
  let interactionVisible = true;

  if (isSmallHeight) {
    // Deterministic degradation: hide objective and interaction, shrink font, stack entity & world more tightly
    objectiveVisible = false;
    interactionVisible = false;
    hudFontSize = '9px';
    hudPaddingX = 4;
    hudPaddingY = 3;
    hudLineSpacing = 1;
    hudWidth = Math.max(140, Math.min(200, originX - padding - 8));

    entityHeight = 4 * 10 + 2 * hudPaddingY; // 4 lines
    worldY = entityY + entityHeight + 4;
    moveY = 60;
  }

  // --- Exploration HUD and Legend Placement ---
  const expLegendWidth = 104;
  const expLegendHeight = 208;
  const expLegendX = padding;
  const expLegendY = isSmallHeight ? 64 : 72;

  // Player-facing labels are deliberately compact and use outlined text rather than
  // an opaque plaque, reducing the amount of world art they can cover.
  const expHudWidth = width < 700 ? 208 : 232;
  const expObjectiveX = width - padding;
  const expObjectiveY = isSmallHeight ? 56 : 64;
  const expInteractionX = width - padding;
  const expInteractionY = isSmallHeight ? 136 : 152;

  const expEntityX = 112; // past the legend width
  const expEntityY = height - (isSmallHeight ? 144 : 176);
  const expWorldX = 112;
  const expWorldY = expEntityY + (isSmallHeight ? 60 : 72) + 8;

  const expMoveX = width - padding;
  const expMoveY = height - (isSmallHeight ? 104 : 128);

  return {
    grid: {
      originX,
      originY,
      cellSize,
      width: gridWidth,
      height: gridHeight,
      cols,
      rows,
    },
    console: {
      x: consoleX,
      y: consoleY,
      width: consoleWidth,
      height: consoleHeight,
      historyX,
      historyY,
      promptsX,
      promptsNormalY,
      promptsAttacksY,
    },
    hpBars: {
      player: { x: padding, y: hpBarY, width: barWidth, height: barHeight },
      opponent: { x: width - padding - barWidth, y: hpBarY, width: barWidth, height: barHeight },
    },
    turnIndicator: {
      x: width / 2,
      y: turnY,
    },
    hud: {
      objective: { x: width - padding, y: objectiveY, width: hudWidth, visible: objectiveVisible, originX: 1 },
      interaction: { x: width - padding, y: interactionY, width: hudWidth, visible: interactionVisible, originX: 1 },
      entity: { x: padding, y: entityY, width: hudWidth, visible: true, originX: 0 },
      world: { x: padding, y: worldY, width: hudWidth, visible: true, originX: 0 },
      move: { x: width - padding, y: moveY, width: hudWidth, visible: true, originX: 1 },
      fontSize: hudFontSize,
      paddingX: hudPaddingX,
      paddingY: hudPaddingY,
      lineSpacing: hudLineSpacing,
    },
    exploration: {
      legend: { x: expLegendX, y: expLegendY, width: expLegendWidth, height: expLegendHeight },
      hud: {
        objective: { x: expObjectiveX, y: expObjectiveY, width: expHudWidth, visible: true, originX: 1 },
        interaction: { x: expInteractionX, y: expInteractionY, width: expHudWidth, visible: true, originX: 1 },
        entity: { x: expEntityX, y: expEntityY, width: expHudWidth, visible: true, originX: 0 },
        world: { x: expWorldX, y: expWorldY, width: expHudWidth, visible: true, originX: 0 },
        move: { x: expMoveX, y: expMoveY, width: expHudWidth, visible: true, originX: 1 },
        fontSize: '12px',
        paddingX: 4,
        paddingY: 3,
        lineSpacing: 2,
      },
      placeholderText: {
        x: width / 2,
        y: height - 28,
      },
    },
  };
}
