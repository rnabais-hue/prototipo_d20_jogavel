import { describe, expect, it } from 'vitest';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getCombatPromptIconPlacements } from './combatPromptIconLayout';

describe('combat prompt icon layout', () => {
  it('never assigns the inspect icon to abilities or their actions', () => {
    expect(getCombatPromptIconPlacements('abilities', true)).toEqual([]);
    expect(getCombatPromptIconPlacements('abilities', false)).toEqual([]);
    expect(getCombatPromptIconPlacements('main', true).map(({ key }) => key))
      .not.toContain(VISUAL_ASSET_KEYS.inspectIcon);
  });

  it('maps only matching semantic roles in the main prompt', () => {
    expect(getCombatPromptIconPlacements('main', true)).toEqual([
      { key: VISUAL_ASSET_KEYS.attackIcon, offsetX: 20 },
      { key: VISUAL_ASSET_KEYS.endTurnIcon, offsetX: 228 },
      { key: VISUAL_ASSET_KEYS.moveIcon, offsetX: 348 },
    ]);
    expect(getCombatPromptIconPlacements('main', false)).toEqual([
      { key: VISUAL_ASSET_KEYS.endTurnIcon, offsetX: 138 },
      { key: VISUAL_ASSET_KEYS.moveIcon, offsetX: 258 },
    ]);
  });

  it('uses the text-only fallback outside the main prompt', () => {
    expect(getCombatPromptIconPlacements('attacks', true)).toEqual([]);
    expect(getCombatPromptIconPlacements('movement', true)).toEqual([]);
  });
});
