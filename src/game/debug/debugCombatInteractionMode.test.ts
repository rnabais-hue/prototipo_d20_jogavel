import { describe, expect, it } from 'vitest';
import { debugCombatModeAllowsMovement, returnToDebugCombatMainMode } from './debugCombatInteractionMode';

describe('debug combat interaction mode', () => {
  it('allows movement only in the main menu', () => {
    expect(debugCombatModeAllowsMovement('main')).toBe(true);
    expect(debugCombatModeAllowsMovement('attacks')).toBe(false);
    expect(debugCombatModeAllowsMovement('abilities')).toBe(false);
  });

  it('returns submenus to the main menu', () => {
    expect(returnToDebugCombatMainMode('attacks')).toBe('main');
    expect(returnToDebugCombatMainMode('abilities')).toBe('main');
  });
});
