import type { GridCell } from '../movement/grid';

export type ExplorableEntityKind = 'expedition_anchor';

export type ExplorableEntity = {
  id: string;
  label: string;
  kind: ExplorableEntityKind;
  cell: GridCell;
};

export function createExplorableEntity(
  id: string,
  label: string,
  cell: GridCell,
  kind: ExplorableEntityKind = 'expedition_anchor',
): ExplorableEntity {
  return {
    id,
    label,
    kind,
    cell,
  };
}

export function relocateExplorableEntity(
  entity: ExplorableEntity,
  cell: GridCell,
): ExplorableEntity {
  return {
    ...entity,
    cell,
  };
}
