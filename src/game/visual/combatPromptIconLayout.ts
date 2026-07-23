import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';

export type CombatPromptIconPlacement = Readonly<{
  key: VisualAssetKey;
  offsetX: number;
}>;

export function getCombatPromptIconPlacements(
  menuState: 'main' | 'attacks' | 'abilities' | 'movement',
  mainActionAvailable: boolean,
): readonly CombatPromptIconPlacement[] {
  if (menuState !== 'main') {
    // No approved semantic icon exists for abilities. Text remains the
    // deterministic code-native fallback until an ability icon is approved.
    return [];
  }

  if (!mainActionAvailable) {
    return [
      { key: VISUAL_ASSET_KEYS.endTurnIcon, offsetX: 138 },
      { key: VISUAL_ASSET_KEYS.moveIcon, offsetX: 258 },
    ];
  }

  return [
    { key: VISUAL_ASSET_KEYS.attackIcon, offsetX: 20 },
    { key: VISUAL_ASSET_KEYS.endTurnIcon, offsetX: 228 },
    { key: VISUAL_ASSET_KEYS.moveIcon, offsetX: 348 },
  ];
}
