import Phaser from 'phaser';
import type { CombatSession } from '../../combat/combatSession';
import {
  projectCombatCellToWorld,
  projectDebugCombatGrid,
  type DebugCombatGridLayout,
} from './debugCombatGridProjection';
import type { DebugCombatInteractionMode } from './debugCombatInteractionMode';
import { COMBAT_LAYER_DEPTHS } from '../visual/combatLayerDepths';
import { createCombatArenaView, type CombatArenaView } from '../visual/createCombatArenaView';
import {
  drawCombatGridLines,
  drawReachableCells,
} from '../visual/combatOverlayPresentation';
import {
  PhaserCombatantViewHandle,
  type CombatantViewHandle,
} from '../visual/combatantViewHandle';
import {
  getCombatSessionLife,
} from '../../combat/combatSession';
import type { GridCell } from '../../movement/grid';
import { getMotionDuration } from '../visual/motionConfig';

// Presentation state the caller passes each frame.
export type DebugCombatGridPresentationState = {
  interactionMode: DebugCombatInteractionMode;
  targetParticipantId?: string;
};

// View handle returned to PrototypeScene.
export type DebugCombatGridView = {
  update: (session: CombatSession, presentation?: DebugCombatGridPresentationState) => void;
  setVisible: (visible: boolean) => void;
  destroy: () => void;
  getHandle: (participantId: string) => CombatantViewHandle | undefined;
  snapAll: (session: CombatSession) => void;
};

// Fixed grid dimensions matching the authoritative 10x8 combat bounds.
const GRID_COLS = 10;
const GRID_ROWS = 8;

// Create the combat grid view with the Milestone 5 persistent handles.
export function createDebugCombatGridView(
  scene: Phaser.Scene,
  layout: DebugCombatGridLayout,
): DebugCombatGridView {
  // Persistent graphics layers
  const arenaView: CombatArenaView = createCombatArenaView(scene, layout, GRID_COLS, GRID_ROWS);

  const gridLines = scene.add
    .graphics()
    .setDepth(COMBAT_LAYER_DEPTHS.gridLines)
    .setScrollFactor(0);

  const reachable = scene.add
    .graphics()
    .setDepth(COMBAT_LAYER_DEPTHS.reachableCells)
    .setScrollFactor(0);

  // Map of persistent combatant token handles
  const handles = new Map<string, CombatantViewHandle>();
  const lastCells = new Map<string, GridCell>();
  let lastLayout: DebugCombatGridLayout | undefined = undefined;

  // Snap all handles to authoritative state
  const snapAll = (session: CombatSession): void => {
    const projection = projectDebugCombatGrid(session, layout);
    projection.combatants.forEach((combatant) => {
      let handle = handles.get(combatant.participantId);
      if (!handle) {
        handle = new PhaserCombatantViewHandle(scene, combatant.participantId, combatant.isPlayer);
        handles.set(combatant.participantId, handle);
      }
      const life = getCombatSessionLife(session, combatant.participantId);
      const defeated = life !== undefined ? life.current <= 0 : false;
      const world = projectCombatCellToWorld(combatant.cell, layout);

      handle.snapToAuthoritativeState(world, {
        active: combatant.active,
        defeated,
        isTarget: false,
        cellSize: layout.cellSize,
      }, true);

      lastCells.set(combatant.participantId, { x: combatant.cell.x, y: combatant.cell.y });
    });
  };

  // Update function
  const update = (
    session: CombatSession,
    presentation: DebugCombatGridPresentationState = { interactionMode: 'main' },
  ): void => {
    const projection = projectDebugCombatGrid(session, layout);

    // Update arena ground (handles resize)
    arenaView.update(layout, GRID_COLS, GRID_ROWS);

    // Grid lines
    drawCombatGridLines(gridLines, layout, GRID_COLS, GRID_ROWS);

    // Reachable movement cell overlays - visible only in main interaction mode
    const cellsToShow = presentation.interactionMode === 'main' ? projection.reachableCells : [];
    drawReachableCells(reachable, cellsToShow, layout);

    // Check if layout resized
    const isResize =
      !lastLayout ||
      lastLayout.originX !== layout.originX ||
      lastLayout.originY !== layout.originY ||
      lastLayout.cellSize !== layout.cellSize;

    if (isResize) {
      lastLayout = { ...layout };
    }

    // Identify active participant IDs from projection to delete stale handles
    const currentIds = new Set(projection.combatants.map((c) => c.participantId));
    handles.forEach((handle, participantId) => {
      if (!currentIds.has(participantId)) {
        handle.destroy();
        handles.delete(participantId);
        lastCells.delete(participantId);
      }
    });

    // Update or create handles for current combatants
    projection.combatants.forEach((combatant) => {
      let handle = handles.get(combatant.participantId);
      const isTarget = combatant.participantId === presentation.targetParticipantId;
      const life = getCombatSessionLife(session, combatant.participantId);
      const defeated = life !== undefined ? life.current <= 0 : false;
      const world = projectCombatCellToWorld(combatant.cell, layout);

      if (!handle) {
        handle = new PhaserCombatantViewHandle(scene, combatant.participantId, combatant.isPlayer);
        handles.set(combatant.participantId, handle);
        handle.snapToAuthoritativeState(world, {
          active: combatant.active,
          defeated,
          isTarget,
          cellSize: layout.cellSize,
        }, true);
        lastCells.set(combatant.participantId, { x: combatant.cell.x, y: combatant.cell.y });
      } else {
        const lastCell = lastCells.get(combatant.participantId);
        const hasMoved = lastCell && (lastCell.x !== combatant.cell.x || lastCell.y !== combatant.cell.y);

        if (isResize) {
          // Snap instantly on resize
          handle.snapToAuthoritativeState(world, {
            active: combatant.active,
            defeated,
            isTarget,
            cellSize: layout.cellSize,
          }, true);
        } else if (hasMoved) {
          // Play movement interpolation tween from previous position
          const prevWorld = projectCombatCellToWorld(lastCell!, layout);
          handle.snapToAuthoritativeState(prevWorld, {
            active: combatant.active,
            defeated,
            isTarget,
            cellSize: layout.cellSize,
          }, true);
          const moveDuration = getMotionDuration('combatMove');
          handle.animatePresentationPosition(world, moveDuration);
        } else {
          // Maintain drawing options while keeping animated position
          handle.snapToAuthoritativeState(
            { x: handle.container.x, y: handle.container.y },
            {
              active: combatant.active,
              defeated,
              isTarget,
              cellSize: layout.cellSize,
            },
            false
          );
        }

        // Update cached position
        lastCells.set(combatant.participantId, { x: combatant.cell.x, y: combatant.cell.y });
      }
    });
  };

  // Visibility
  const setVisible = (visible: boolean): void => {
    arenaView.setVisible(visible);
    gridLines.setVisible(visible);
    reachable.setVisible(visible);
    handles.forEach((handle) => {
      handle.container.setVisible(visible);
    });
  };

  // Destroy
  const destroy = (): void => {
    arenaView.destroy();
    gridLines.destroy();
    reachable.destroy();
    handles.forEach((handle) => {
      handle.destroy();
    });
    handles.clear();
    lastCells.clear();
  };

  const getHandle = (participantId: string): CombatantViewHandle | undefined => {
    return handles.get(participantId);
  };

  return { update, setVisible, destroy, getHandle, snapAll };
}
