import type { GridCell } from './grid';

/**
 * Returns a deterministic straight Manhattan preview path.
 *
 * The path excludes the origin, includes the destination, walks X first,
 * then walks Y. This is only a geometric preview and does not pathfind.
 */
export function getStraightManhattanPath(
  fromCell: GridCell,
  toCell: GridCell,
): GridCell[] {
  const path: GridCell[] = [];
  let currentX = fromCell.x;
  let currentY = fromCell.y;
  const stepX = Math.sign(toCell.x - fromCell.x);
  const stepY = Math.sign(toCell.y - fromCell.y);

  while (currentX !== toCell.x) {
    currentX += stepX;
    path.push({ x: currentX, y: currentY });
  }

  while (currentY !== toCell.y) {
    currentY += stepY;
    path.push({ x: currentX, y: currentY });
  }

  return path;
}
