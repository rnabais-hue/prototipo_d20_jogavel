import { describe, it, expect } from 'vitest';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';
import { COMBAT_VISUAL_COLORS } from './combatVisualConfig';
import {
  mapCombatantVisualRole,
  mapCombatantVisualState,
  getCombatTeamPalette,
  mapAvailabilityPresentation,
  getAvailabilityColor,
  getAvailabilityLabel,
  mapRangeBandPresentation,
} from './combatantPresentation';
import {
  getRangeBandConfig,
  getAllRangeBandConfigs,
} from './combatRangePresentation';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
import { getCombatGroundTileScale } from './createCombatArenaView';
import { getCombatantDisplaySize } from './createCombatantView';

// -- Layer depth ordering --------------------------------------------------

describe('Combat layer depths', () => {
  it('should have arena ground below grid lines', () => {
    expect(COMBAT_LAYER_DEPTHS.arenaGround).toBeLessThan(COMBAT_LAYER_DEPTHS.gridLines);
  });

  it('should have grid lines below reachable cells', () => {
    expect(COMBAT_LAYER_DEPTHS.gridLines).toBeLessThan(COMBAT_LAYER_DEPTHS.reachableCells);
  });

  it('should have reachable cells below active marker', () => {
    expect(COMBAT_LAYER_DEPTHS.reachableCells).toBeLessThan(COMBAT_LAYER_DEPTHS.activeMarker);
  });

  it('should have active marker below target marker', () => {
    expect(COMBAT_LAYER_DEPTHS.activeMarker).toBeLessThan(COMBAT_LAYER_DEPTHS.targetMarker);
  });

  it('should have target marker below combatant tokens', () => {
    expect(COMBAT_LAYER_DEPTHS.targetMarker).toBeLessThan(COMBAT_LAYER_DEPTHS.combatantTokens);
  });

  it('should have combatant tokens below combat UI', () => {
    expect(COMBAT_LAYER_DEPTHS.combatantTokens).toBeLessThan(COMBAT_LAYER_DEPTHS.combatUI);
  });

  it('should have all depths as non-negative integers', () => {
    for (const depth of Object.values(COMBAT_LAYER_DEPTHS)) {
      expect(depth).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(depth)).toBe(true);
    }
  });
});

// -- Palette distinction ---------------------------------------------------

describe('Combat visual palette', () => {
  it('should have distinct player and enemy fill colors', () => {
    expect(COMBAT_VISUAL_COLORS.playerFill).not.toBe(COMBAT_VISUAL_COLORS.enemyFill);
  });

  it('should have distinct active gold vs target coral', () => {
    expect(COMBAT_VISUAL_COLORS.activeGold).not.toBe(COMBAT_VISUAL_COLORS.targetCoral);
  });

  it('should have distinct reachable fill vs reachable stroke', () => {
    expect(COMBAT_VISUAL_COLORS.reachableFill).not.toBe(COMBAT_VISUAL_COLORS.reachableStroke);
  });

  it('should have distinct melee, short, and long range colors', () => {
    expect(COMBAT_VISUAL_COLORS.meleeRange).not.toBe(COMBAT_VISUAL_COLORS.shortRange);
    expect(COMBAT_VISUAL_COLORS.meleeRange).not.toBe(COMBAT_VISUAL_COLORS.longRange);
    expect(COMBAT_VISUAL_COLORS.shortRange).not.toBe(COMBAT_VISUAL_COLORS.longRange);
  });

  it('should have distinct ready vs blocked colors', () => {
    expect(COMBAT_VISUAL_COLORS.readyColor).not.toBe(COMBAT_VISUAL_COLORS.blockedColor);
  });

  it('should have all color values as valid hex numbers', () => {
    for (const value of Object.values(COMBAT_VISUAL_COLORS)) {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xffffff);
    }
  });
});

// -- Combatant visual role mapping -----------------------------------------

describe('mapCombatantVisualRole', () => {
  it('should map isPlayer=true to player role', () => {
    expect(mapCombatantVisualRole(true)).toBe('player');
  });

  it('should map isPlayer=false to enemy role', () => {
    expect(mapCombatantVisualRole(false)).toBe('enemy');
  });
});

// -- Combatant visual state mapping ----------------------------------------

describe('mapCombatantVisualState', () => {
  it('should return defeated when defeated is true regardless of active', () => {
    expect(mapCombatantVisualState(true, true)).toBe('defeated');
    expect(mapCombatantVisualState(false, true)).toBe('defeated');
  });

  it('should return active when active is true and not defeated', () => {
    expect(mapCombatantVisualState(true, false)).toBe('active');
  });

  it('should return idle when not active and not defeated', () => {
    expect(mapCombatantVisualState(false, false)).toBe('idle');
  });
});

// -- Team palette ----------------------------------------------------------

describe('getCombatTeamPalette', () => {
  it('should return player palette for player role', () => {
    const palette = getCombatTeamPalette('player');
    expect(palette.fill).toBe(COMBAT_VISUAL_COLORS.playerFill);
    expect(palette.rim).toBe(COMBAT_VISUAL_COLORS.playerRim);
    expect(palette.emblem).toBe(COMBAT_VISUAL_COLORS.playerEmblem);
  });

  it('should return enemy palette for enemy role', () => {
    const palette = getCombatTeamPalette('enemy');
    expect(palette.fill).toBe(COMBAT_VISUAL_COLORS.enemyFill);
    expect(palette.rim).toBe(COMBAT_VISUAL_COLORS.enemyRim);
    expect(palette.emblem).toBe(COMBAT_VISUAL_COLORS.enemyEmblem);
  });

  it('should have distinct fill colors between player and enemy palettes', () => {
    const pp = getCombatTeamPalette('player');
    const ep = getCombatTeamPalette('enemy');
    expect(pp.fill).not.toBe(ep.fill);
    expect(pp.rim).not.toBe(ep.rim);
  });
});

// -- Availability presentation ---------------------------------------------

describe('mapAvailabilityPresentation', () => {
  it('should map true to ready', () => {
    expect(mapAvailabilityPresentation(true)).toBe('ready');
  });

  it('should map false to blocked', () => {
    expect(mapAvailabilityPresentation(false)).toBe('blocked');
  });
});

describe('getAvailabilityColor', () => {
  it('should return ready color for ready state', () => {
    expect(getAvailabilityColor('ready')).toBe(COMBAT_VISUAL_COLORS.readyColor);
  });

  it('should return blocked color for blocked state', () => {
    expect(getAvailabilityColor('blocked')).toBe(COMBAT_VISUAL_COLORS.blockedColor);
  });
});

describe('getAvailabilityLabel', () => {
  it('should return READY for ready state', () => {
    expect(getAvailabilityLabel('ready')).toBe('READY');
  });

  it('should return BLOCKED for blocked state', () => {
    expect(getAvailabilityLabel('blocked')).toBe('BLOCKED');
  });
});

// -- Range band presentation via combatantPresentation --------------------

describe('mapRangeBandPresentation (via combatantPresentation)', () => {
  it('should map melee band', () => {
    const result = mapRangeBandPresentation('melee');
    expect(result.band).toBe('melee');
    expect(result.label).toBe('Melee');
    expect(result.color).toBe(COMBAT_VISUAL_COLORS.meleeRange);
  });

  it('should map short band', () => {
    const result = mapRangeBandPresentation('short');
    expect(result.band).toBe('short');
    expect(result.label).toBe('Short');
    expect(result.color).toBe(COMBAT_VISUAL_COLORS.shortRange);
  });

  it('should map long band', () => {
    const result = mapRangeBandPresentation('long');
    expect(result.band).toBe('long');
    expect(result.label).toBe('Long');
    expect(result.color).toBe(COMBAT_VISUAL_COLORS.longRange);
  });

  it('should return distinct colors for all three bands', () => {
    const m = mapRangeBandPresentation('melee');
    const s = mapRangeBandPresentation('short');
    const l = mapRangeBandPresentation('long');
    expect(m.color).not.toBe(s.color);
    expect(m.color).not.toBe(l.color);
    expect(s.color).not.toBe(l.color);
  });
});

// -- Range band config (combatRangePresentation) ---------------------------

describe('getRangeBandConfig', () => {
  it('should return melee config with heavy weight', () => {
    const cfg = getRangeBandConfig('melee');
    expect(cfg.band).toBe('melee');
    expect(cfg.weight).toBe('heavy');
    expect(cfg.readyColor).not.toBe(cfg.blockedColor);
  });

  it('should return short config with medium weight', () => {
    const cfg = getRangeBandConfig('short');
    expect(cfg.band).toBe('short');
    expect(cfg.weight).toBe('medium');
  });

  it('should return long config with light weight', () => {
    const cfg = getRangeBandConfig('long');
    expect(cfg.band).toBe('long');
    expect(cfg.weight).toBe('light');
  });

  it('should have distinct ready colors across all range bands', () => {
    const m = getRangeBandConfig('melee');
    const s = getRangeBandConfig('short');
    const l = getRangeBandConfig('long');
    expect(m.readyColor).not.toBe(s.readyColor);
    expect(m.readyColor).not.toBe(l.readyColor);
    expect(s.readyColor).not.toBe(l.readyColor);
  });
});

describe('getAllRangeBandConfigs', () => {
  it('should return exactly three configs', () => {
    expect(getAllRangeBandConfigs().length).toBe(3);
  });

  it('should return them in melee, short, long order', () => {
    const configs = getAllRangeBandConfigs();
    expect(configs[0]?.band).toBe('melee');
    expect(configs[1]?.band).toBe('short');
    expect(configs[2]?.band).toBe('long');
  });
});

// -- Asset catalog integration and Fallback Resolution ---------------------

describe('Combat asset catalog integration', () => {
  it('should register the approved combat ground while preserving its fallback role', () => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.combatGround);
    expect(entry.key).toBe('visual.combat.terrain.ground');
    expect(entry.source).toBe('generated-raster');
    expect(entry.path).toBe('/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png');
    expect(entry.loadByDefault).toBe(true);
    expect(entry.fallback).toBe('terrain');
  });

  it('should have playerActor key mapped to player fallback', () => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor);
    expect(entry.fallback).toBe('player');
  });

  it('should have enemyActor key mapped to enemy fallback', () => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.enemyActor);
    expect(entry.fallback).toBe('enemy');
  });

  it('should have distinct keys for player and enemy actors', () => {
    expect(VISUAL_ASSET_KEYS.playerActor).not.toBe(VISUAL_ASSET_KEYS.enemyActor);
  });

  it('should select the deterministic terrain fallback when the approved texture is absent', () => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.combatGround);
    const resolution = resolveVisualAsset(entry, () => false);
    expect(resolution.mode).toBe('fallback');
    expect(resolution.reason).toBe('not-loaded');
  });

  it('should scale the combat master to exactly one current grid cell', () => {
    expect(getCombatGroundTileScale(1254, 1254, 42)).toEqual({
      x: 42 / 1254,
      y: 42 / 1254,
    });
    expect(getCombatGroundTileScale(1254, 1254, 14.5)).toEqual({
      x: 14.5 / 1254,
      y: 14.5 / 1254,
    });
  });

  it('should fit a 256px actor texture to 70% of the responsive combat cell', () => {
    const maximum = getCombatantDisplaySize(256, 256, 42 * 0.7);
    expect(maximum.width).toBeCloseTo(29.4);
    expect(maximum.height).toBeCloseTo(29.4);

    const compact = getCombatantDisplaySize(256, 256, 14.5 * 0.7);
    expect(compact.width).toBeCloseTo(10.15);
    expect(compact.height).toBeCloseTo(10.15);
  });

  it('should preserve non-square texture aspect ratio inside the combat diameter', () => {
    expect(getCombatantDisplaySize(256, 128, 28)).toEqual({
      width: 28,
      height: 14,
    });
  });

  it('should select not-loaded fallback for player/enemy actors when textures are absent', () => {
    const playerEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor);
    const playerRes = resolveVisualAsset(playerEntry, () => false);
    expect(playerRes.mode).toBe('fallback');
    expect(playerRes.reason).toBe('not-loaded');

    const enemyEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.enemyActor);
    const enemyRes = resolveVisualAsset(enemyEntry, () => false);
    expect(enemyRes.mode).toBe('fallback');
    expect(enemyRes.reason).toBe('not-loaded');
  });
});

// -- Range and availability runtime integration checks ----------------------

describe('Range and availability runtime view/menu helper output', () => {
  it('should produce distinct visible configurations for all three bands', () => {
    const meleeCfg = getRangeBandConfig('melee');
    const shortCfg = getRangeBandConfig('short');
    const longCfg = getRangeBandConfig('long');

    expect(meleeCfg.weight).toBe('heavy');
    expect(shortCfg.weight).toBe('medium');
    expect(longCfg.weight).toBe('light');

    expect(meleeCfg.readyColor).toBe(COMBAT_VISUAL_COLORS.meleeRange);
    expect(shortCfg.readyColor).toBe(COMBAT_VISUAL_COLORS.shortRange);
    expect(longCfg.readyColor).toBe(COMBAT_VISUAL_COLORS.longRange);
  });

  it('should keep READY/BLOCKED explicit in labels and separate from visual colors', () => {
    const readyLabel = getAvailabilityLabel('ready');
    const blockedLabel = getAvailabilityLabel('blocked');

    expect(readyLabel).toBe('READY');
    expect(blockedLabel).toBe('BLOCKED');

    // Ensure status labels can be read without checking color/hex
    expect(typeof readyLabel).toBe('string');
    expect(typeof blockedLabel).toBe('string');
    expect(readyLabel.length).toBeGreaterThan(0);
    expect(blockedLabel.length).toBeGreaterThan(0);
  });
});
