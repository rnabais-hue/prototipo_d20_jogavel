import { describe, expect, it } from 'vitest';
import {
  createExplorableEntity,
  relocateExplorableEntity,
} from './explorableEntity';

describe('createExplorableEntity', () => {
  it('creates a minimal explorable entity with the default kind', () => {
    expect(createExplorableEntity('entity-1', 'Scout Token', { x: 2, y: 3 })).toEqual({
      id: 'entity-1',
      label: 'Scout Token',
      kind: 'expedition_anchor',
      cell: { x: 2, y: 3 },
    });
  });
});

describe('relocateExplorableEntity', () => {
  it('returns a new entity with the updated grid cell', () => {
    const entity = createExplorableEntity('entity-1', 'Scout Token', {
      x: 1,
      y: 1,
    });

    const relocatedEntity = relocateExplorableEntity(entity, { x: 4, y: 2 });

    expect(relocatedEntity).toEqual({
      id: 'entity-1',
      label: 'Scout Token',
      kind: 'expedition_anchor',
      cell: { x: 4, y: 2 },
    });
    expect(relocatedEntity).not.toBe(entity);
    expect(entity.cell).toEqual({ x: 1, y: 1 });
  });
});
