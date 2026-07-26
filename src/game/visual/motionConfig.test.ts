import { describe, expect, it, afterEach } from 'vitest';
import {
  getMotionDuration,
  getCombatMoveDuration,
  isReducedMotion,
  setReducedMotion,
  MOTION_DURATIONS,
} from './motionConfig';

describe('motionConfig', () => {
  afterEach(() => {
    // Reset state to avoid test pollution
    setReducedMotion(false);
  });

  it('defaults to normal motion with correct durations', () => {
    expect(isReducedMotion()).toBe(false);
    expect(getMotionDuration('selection')).toBe(MOTION_DURATIONS.selection);
    expect(getMotionDuration('anticipation')).toBe(MOTION_DURATIONS.anticipation);
    expect(getMotionDuration('lunge')).toBe(MOTION_DURATIONS.lunge);
    expect(getMotionDuration('hitReaction')).toBe(MOTION_DURATIONS.hitReaction);
    expect(getMotionDuration('missEvade')).toBe(MOTION_DURATIONS.missEvade);
    expect(getMotionDuration('combatMove')).toBe(MOTION_DURATIONS.combatMove);
    expect(getMotionDuration('recovery')).toBe(MOTION_DURATIONS.recovery);
    expect(getCombatMoveDuration({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(120);
    expect(getCombatMoveDuration({ x: 0, y: 0 }, { x: 3, y: 2 })).toBe(600);
    expect(getMotionDuration('defeat')).toBe(MOTION_DURATIONS.defeat);
  });

  it('correctly enables and disables reduced-motion mode', () => {
    setReducedMotion(true);
    expect(isReducedMotion()).toBe(true);

    setReducedMotion(false);
    expect(isReducedMotion()).toBe(false);
  });

  it('returns zero durations when reduced-motion mode is active', () => {
    setReducedMotion(true);
    expect(getMotionDuration('selection')).toBe(0);
    expect(getMotionDuration('anticipation')).toBe(0);
    expect(getMotionDuration('lunge')).toBe(0);
    expect(getMotionDuration('hitReaction')).toBe(0);
    expect(getMotionDuration('missEvade')).toBe(0);
    expect(getMotionDuration('combatMove')).toBe(0);
    expect(getMotionDuration('recovery')).toBe(0);
    expect(getCombatMoveDuration({ x: 0, y: 0 }, { x: 3, y: 2 })).toBe(0);
    expect(getMotionDuration('defeat')).toBe(0);
  });
});
