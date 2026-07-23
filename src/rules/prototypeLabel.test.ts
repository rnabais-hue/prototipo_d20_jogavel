import { describe, expect, it } from 'vitest';
import { getPrototypeLabel } from './prototypeLabel';

describe('getPrototypeLabel', () => {
  it('returns the internal project description', () => {
    expect(getPrototypeLabel()).toBe('custom d20-inspired tactical RPG prototype');
  });
});
