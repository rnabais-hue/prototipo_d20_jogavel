export type WorldPosition = {
  x: number;
  y: number;
};

export type GridCell = {
  x: number;
  y: number;
};

export type GridBounds = {
  width: number;
  height: number;
};

export function worldToGrid(
  position: WorldPosition,
  cellSize: number,
): GridCell {
  return {
    x: Math.floor(position.x / cellSize),
    y: Math.floor(position.y / cellSize),
  };
}

export function gridToWorld(cell: GridCell, cellSize: number): WorldPosition {
  const cellCenterOffset = cellSize / 2;

  return {
    x: cell.x * cellSize + cellCenterOffset,
    y: cell.y * cellSize + cellCenterOffset,
  };
}

export function isCellInsideGrid(
  cell: GridCell,
  bounds: GridBounds,
): boolean {
  return (
    cell.x >= 0
    && cell.y >= 0
    && cell.x < bounds.width
    && cell.y < bounds.height
  );
}
