import {
  getCombatSessionActiveParticipant,
  getCombatSessionPositioning,
  getCombatSessionRemainingMovement,
  type CombatSession,
} from '../../combat/combatSession';
import { validateCombatMovementDestination } from '../../combat/combatPositioning';
import { gridToWorld, type GridBounds, type GridCell } from '../../movement/grid';

export type DebugCombatGridLayout = { originX: number; originY: number; cellSize: number };

export type DebugCombatPointerPosition = { x: number; y: number };

export function projectCombatPointerToCell(
  position: DebugCombatPointerPosition,
  layout: DebugCombatGridLayout,
  bounds: GridBounds,
): GridCell | undefined {
  const localX = position.x - layout.originX;
  const localY = position.y - layout.originY;
  if (localX < 0 || localY < 0 || localX >= bounds.width * layout.cellSize || localY >= bounds.height * layout.cellSize) {
    return undefined;
  }
  return { x: Math.floor(localX / layout.cellSize), y: Math.floor(localY / layout.cellSize) };
}

export function projectCombatCellToWorld(cell: GridCell, layout: DebugCombatGridLayout) {
  const local = gridToWorld(cell, layout.cellSize);
  return { x: layout.originX + local.x, y: layout.originY + local.y };
}

export function projectDebugCombatGrid(session: CombatSession, layout: DebugCombatGridLayout) {
  const positioning = getCombatSessionPositioning(session);
  const active = getCombatSessionActiveParticipant(session);
  const playerParticipantId = session.preset.sheets[0]?.participantId;
  const combatants = Object.entries(positioning.positions).map(([participantId, cell]) => ({
    participantId, cell, world: projectCombatCellToWorld(cell, layout), active: participantId === active?.id,
    isPlayer: participantId === playerParticipantId,
  }));
  const reachableCells: GridCell[] = [];
  const remaining = getCombatSessionRemainingMovement(session);
  if (active && remaining > 0) {
    for (let y = 0; y < positioning.bounds.height; y += 1) {
      for (let x = 0; x < positioning.bounds.width; x += 1) {
        const destination = { x, y };
        const result = validateCombatMovementDestination(positioning, {
          participantId: active.id, destination, range: remaining,
        });
        if (result.ok && result.distance > 0) reachableCells.push(destination);
      }
    }
  }
  return { bounds: positioning.bounds, combatants, reachableCells };
}
