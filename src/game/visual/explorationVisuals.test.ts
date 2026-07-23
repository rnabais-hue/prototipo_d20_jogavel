import { describe, it, expect } from 'vitest';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getVisualAssetEntry } from './assetCatalog';
import { getExitPortalVisualState } from './exitPortalState';
import { createInterestPoint } from '../../exploration/interestPoint';

describe('Exploration Visual Configuration', () => {
  it('should define distinct color values in the palette', () => {
    expect(EXPLORATION_VISUAL_COLORS.charcoal).toBe(0x15181f);
    expect(EXPLORATION_VISUAL_COLORS.slate).toBe(0x283548);
    expect(EXPLORATION_VISUAL_COLORS.moss).toBe(0x587a4d);
    expect(EXPLORATION_VISUAL_COLORS.earth).toBe(0x8a6846);
    expect(EXPLORATION_VISUAL_COLORS.cyan).toBe(0x4fb3d9);
    expect(EXPLORATION_VISUAL_COLORS.violet).toBe(0xb983ff);
    expect(EXPLORATION_VISUAL_COLORS.amber).toBe(0xf2c14e);
    expect(EXPLORATION_VISUAL_COLORS.dangerCoral).toBe(0xe85d5d);
  });

  it('should maintain the correct depth layering hierarchy', () => {
    expect(EXPLORATION_DEPTHS.terrain).toBeLessThan(EXPLORATION_DEPTHS.overlays);
    expect(EXPLORATION_DEPTHS.overlays).toBeLessThan(EXPLORATION_DEPTHS.pointsOfInterest);
    expect(EXPLORATION_DEPTHS.pointsOfInterest).toBeLessThan(EXPLORATION_DEPTHS.actors);
    expect(EXPLORATION_DEPTHS.actors).toBeLessThan(EXPLORATION_DEPTHS.ui);
  });

  it('should verify ground contrast values', () => {
    expect(EXPLORATION_VISUAL_COLORS.groundBase).not.toBe(EXPLORATION_VISUAL_COLORS.groundAccent);
  });
});

describe('Milestone 2 Foundation Integration', () => {
  it('should map playerActor to player fallback role', () => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor);
    expect(entry.fallback).toBe('player');
    expect(entry.key).toBe('visual.actor.player');
  });

  it('should map terrain and obstacles to their respective fallback roles', () => {
    const groundEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.explorationGround);
    const wallEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.wallObstacle);
    expect(groundEntry.fallback).toBe('terrain');
    expect(wallEntry.fallback).toBe('obstacle');
  });

  it('should map POI kinds to correct fallback roles in catalog', () => {
    expect(getVisualAssetEntry(VISUAL_ASSET_KEYS.surveyPoint).fallback).toBe('survey');
    expect(getVisualAssetEntry(VISUAL_ASSET_KEYS.switchPoint).fallback).toBe('switch');
    expect(getVisualAssetEntry(VISUAL_ASSET_KEYS.exitPoint).fallback).toBe('exit');
    expect(getVisualAssetEntry(VISUAL_ASSET_KEYS.encounterPoint).fallback).toBe('encounter');
  });
});

describe('Exit Portal Visual States', () => {
  const exitPoint = createInterestPoint('poi-exit-1', 'Exit', { x: 14, y: 3 }, 'exit_marker');
  const switchPoint = createInterestPoint('poi-switch-1', 'Switch', { x: 10, y: 6 }, 'switch');
  
  const requirements = {
    'poi-exit-1': {
      type: 'switch_active' as const,
      switchId: 'poi-switch-1',
    }
  };

  it('should resolve to locked when the required switch is inactive', () => {
    const switchInactive = { ...switchPoint, debugFlagActive: false };
    const points = [exitPoint, switchInactive];
    const state = getExitPortalVisualState(exitPoint, points, requirements);
    expect(state).toBe('locked');
  });

  it('should resolve to available when the required switch is active and exit is not completed', () => {
    const switchActive = { ...switchPoint, debugFlagActive: true };
    const points = [exitPoint, switchActive];
    const state = getExitPortalVisualState(exitPoint, points, requirements);
    expect(state).toBe('available');
  });

  it('should resolve to completed when the exit point itself is inspected', () => {
    const switchActive = { ...switchPoint, debugFlagActive: true };
    const exitCompleted = { ...exitPoint, state: 'inspected' as const };
    const points = [exitCompleted, switchActive];
    const state = getExitPortalVisualState(exitCompleted, points, requirements);
    expect(state).toBe('completed');
  });
});
