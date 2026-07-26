import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';

export type CombatAppearanceRole = 'player' | 'enemy';
export type CombatAppearanceState = 'idle' | 'movement' | 'attack' | 'hit' | 'defeat';
export type CombatAppearanceLayerSlot =
  | 'body'
  | 'outfit'
  | 'mainHand'
  | 'offHand'
  | 'accessory';

export type CombatAppearanceProfile = Readonly<{
  id: string;
  role: CombatAppearanceRole;
  nativeUnit: 16;
  facing: 'south';
  displayScale: 2;
  anchor: Readonly<{ x: 0.5; y: 0.9375 }>;
  body: VisualAssetKey;
  outfit?: VisualAssetKey;
  mainHand?: VisualAssetKey;
  offHand?: VisualAssetKey;
  accessory?: VisualAssetKey;
  effectSet?: string;
}>;

export type CombatAppearanceAnimation = Readonly<{
  frames: readonly number[];
  duration: number;
  repeat: number;
}>;

const anchor = Object.freeze({ x: 0.5, y: 0.9375 } as const);

export const COMBAT_APPEARANCE_ANIMATIONS: Readonly<
  Record<CombatAppearanceState, CombatAppearanceAnimation>
> = Object.freeze({
  idle: Object.freeze({ frames: Object.freeze([0, 1, 2, 3]), duration: 1000, repeat: -1 }),
  movement: Object.freeze({ frames: Object.freeze([4, 5, 6, 7]), duration: 400, repeat: -1 }),
  attack: Object.freeze({ frames: Object.freeze([8, 9, 10, 11]), duration: 320, repeat: 0 }),
  hit: Object.freeze({ frames: Object.freeze([12, 13, 14, 15]), duration: 240, repeat: 0 }),
  defeat: Object.freeze({ frames: Object.freeze([16, 17, 18, 19]), duration: 480, repeat: 0 }),
});

const playerSword = Object.freeze({
  id: 'combat.player.sword',
  role: 'player',
  nativeUnit: 16,
  facing: 'south',
  displayScale: 2,
  anchor,
  body: VISUAL_ASSET_KEYS.combatPlayerBody,
  mainHand: VISUAL_ASSET_KEYS.combatPlayerMainHandSword,
  effectSet: 'combat.pixel.default',
} satisfies CombatAppearanceProfile);

const playerSpear = Object.freeze({
  ...playerSword,
  id: 'combat.player.spear',
  mainHand: VISUAL_ASSET_KEYS.combatPlayerMainHandSpear,
} satisfies CombatAppearanceProfile);

const enemyAxe = Object.freeze({
  id: 'combat.enemy.axe',
  role: 'enemy',
  nativeUnit: 16,
  facing: 'south',
  displayScale: 2,
  anchor,
  body: VISUAL_ASSET_KEYS.combatEnemyBody,
  mainHand: VISUAL_ASSET_KEYS.combatEnemyMainHandAxe,
  effectSet: 'combat.pixel.default',
} satisfies CombatAppearanceProfile);

export const COMBAT_APPEARANCE_PROFILES: Readonly<
  Record<string, CombatAppearanceProfile>
> = Object.freeze({
  [playerSword.id]: playerSword,
  [playerSpear.id]: playerSpear,
  [enemyAxe.id]: enemyAxe,
});

const DEFAULT_PROFILE_ID: Readonly<Record<CombatAppearanceRole, string>> = Object.freeze({
  player: playerSword.id,
  enemy: enemyAxe.id,
});

const LAYER_ORDER: readonly CombatAppearanceLayerSlot[] = Object.freeze([
  'body',
  'outfit',
  'mainHand',
  'offHand',
  'accessory',
]);

export function resolveCombatAppearanceProfile(
  role: CombatAppearanceRole,
  requestedId?: string | null,
): CombatAppearanceProfile {
  const requested = requestedId ? COMBAT_APPEARANCE_PROFILES[requestedId] : undefined;
  if (requested?.role === role) {
    return requested;
  }
  return COMBAT_APPEARANCE_PROFILES[DEFAULT_PROFILE_ID[role]];
}

export function getRequestedCombatAppearanceId(
  search: string,
  role: CombatAppearanceRole,
): string | undefined {
  const value = new URLSearchParams(search).get(`visual.${role}`)?.trim();
  return value || undefined;
}

export function resolveCombatAppearanceLayers(
  profile: CombatAppearanceProfile,
): readonly Readonly<{ slot: CombatAppearanceLayerSlot; textureKey: VisualAssetKey }>[] {
  const layers: Array<Readonly<{ slot: CombatAppearanceLayerSlot; textureKey: VisualAssetKey }>> = [];
  for (const slot of LAYER_ORDER) {
    const textureKey = profile[slot];
    if (textureKey) {
      layers.push(Object.freeze({ slot, textureKey }));
    }
  }
  return Object.freeze(layers);
}

export function getCombatAppearanceAnimation(
  state: CombatAppearanceState,
): CombatAppearanceAnimation {
  return COMBAT_APPEARANCE_ANIMATIONS[state];
}
