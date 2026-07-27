import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';

export type CombatAppearanceRole = 'player' | 'enemy';
export type CombatAppearanceState = 'idle' | 'movement' | 'attack' | 'hit' | 'defeat';
export type CombatFacing = 'north' | 'east' | 'south' | 'west';
export type CombatAppearanceLayerSlot =
  | 'body'
  | 'outfit'
  | 'mainHand'
  | 'offHand'
  | 'accessory';

export type CombatAppearanceAnimation = Readonly<{
  frames: readonly number[];
  duration: number;
  repeat: number;
}>;

export type CombatFacingPresentation = Readonly<{
  animations: Readonly<Record<CombatAppearanceState, CombatAppearanceAnimation>>;
  flipX?: boolean;
}>;

export type CombatAppearanceProfile = Readonly<{
  id: string;
  role: CombatAppearanceRole;
  nativeUnit: 16;
  facing: CombatFacing;
  displayScale: 2;
  anchor: Readonly<{ x: 0.5; y: 0.9375 }>;
  body: VisualAssetKey;
  outfit?: VisualAssetKey;
  mainHand?: VisualAssetKey;
  offHand?: VisualAssetKey;
  accessory?: VisualAssetKey;
  effectSet?: string;
  presentation?: Readonly<Record<CombatFacing, CombatFacingPresentation>>;
}>;

const anchor = Object.freeze({ x: 0.5, y: 0.9375 } as const);

export const COMBAT_FACINGS: readonly CombatFacing[] = Object.freeze([
  'north',
  'east',
  'south',
  'west',
]);

export const COMBAT_APPEARANCE_STATES: readonly CombatAppearanceState[] = Object.freeze([
  'idle',
  'movement',
  'attack',
  'hit',
  'defeat',
]);

export const COMBAT_APPEARANCE_ANIMATIONS: Readonly<
  Record<CombatAppearanceState, CombatAppearanceAnimation>
> = Object.freeze({
  idle: Object.freeze({ frames: Object.freeze([0, 1, 2, 3]), duration: 1000, repeat: -1 }),
  movement: Object.freeze({ frames: Object.freeze([4, 5, 6, 7]), duration: 400, repeat: -1 }),
  attack: Object.freeze({ frames: Object.freeze([8, 9, 10, 11]), duration: 320, repeat: 0 }),
  hit: Object.freeze({ frames: Object.freeze([12, 13, 14, 15]), duration: 240, repeat: 0 }),
  defeat: Object.freeze({ frames: Object.freeze([16, 17, 18, 19]), duration: 480, repeat: 0 }),
});

function animationFromPair(
  frames: readonly [number, number],
  state: CombatAppearanceState,
): CombatAppearanceAnimation {
  const timing = COMBAT_APPEARANCE_ANIMATIONS[state];
  return Object.freeze({
    frames: Object.freeze([frames[0], frames[1], frames[0], frames[1]]),
    duration: timing.duration,
    repeat: timing.repeat,
  });
}

function facingPresentation(
  frames: readonly [number, number],
  flipX = false,
): CombatFacingPresentation {
  return Object.freeze({
    animations: Object.freeze({
      idle: animationFromPair(frames, 'idle'),
      movement: animationFromPair(frames, 'movement'),
      attack: animationFromPair(frames, 'attack'),
      hit: animationFromPair(frames, 'hit'),
      defeat: animationFromPair(frames, 'defeat'),
    }),
    flipX,
  });
}

const CARDINAL_EIGHT_FRAME_PRESENTATION = Object.freeze({
  north: facingPresentation([6, 7]),
  east: facingPresentation([2, 3]),
  south: facingPresentation([0, 1]),
  west: facingPresentation([4, 5]),
} satisfies Record<CombatFacing, CombatFacingPresentation>);

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

const combatant = Object.freeze({
  id: 'combat.player.combatant',
  role: 'player',
  nativeUnit: 16,
  facing: 'south',
  displayScale: 2,
  anchor,
  body: VISUAL_ASSET_KEYS.combatBreadthBody,
  outfit: VISUAL_ASSET_KEYS.combatBreadthOutfitCombatant,
  mainHand: VISUAL_ASSET_KEYS.combatBreadthMainHandSword,
  effectSet: 'combat.pixel.default',
  presentation: CARDINAL_EIGHT_FRAME_PRESENTATION,
} satisfies CombatAppearanceProfile);

const combatantSpear = Object.freeze({
  ...combatant,
  id: 'combat.player.combatant-spear',
  mainHand: VISUAL_ASSET_KEYS.combatBreadthMainHandSpear,
} satisfies CombatAppearanceProfile);

const caster = Object.freeze({
  id: 'combat.player.caster',
  role: 'player',
  nativeUnit: 16,
  facing: 'south',
  displayScale: 2,
  anchor,
  body: VISUAL_ASSET_KEYS.combatBreadthBody,
  outfit: VISUAL_ASSET_KEYS.combatBreadthOutfitCaster,
  mainHand: VISUAL_ASSET_KEYS.combatBreadthMainHandStaff,
  accessory: VISUAL_ASSET_KEYS.combatBreadthAccessoryCaster,
  effectSet: 'combat.pixel.default',
  presentation: CARDINAL_EIGHT_FRAME_PRESENTATION,
} satisfies CombatAppearanceProfile);

const specialist = Object.freeze({
  id: 'combat.player.specialist',
  role: 'player',
  nativeUnit: 16,
  facing: 'south',
  displayScale: 2,
  anchor,
  body: VISUAL_ASSET_KEYS.combatBreadthBody,
  outfit: VISUAL_ASSET_KEYS.combatBreadthOutfitSpecialist,
  offHand: VISUAL_ASSET_KEYS.combatBreadthOffHandBow,
  accessory: VISUAL_ASSET_KEYS.combatBreadthAccessorySpecialist,
  effectSet: 'combat.pixel.default',
  presentation: CARDINAL_EIGHT_FRAME_PRESENTATION,
} satisfies CombatAppearanceProfile);

export const MODULAR_CHARACTER_PRIMARY_PROFILE_IDS = Object.freeze([
  combatant.id,
  caster.id,
  specialist.id,
] as const);

export const MODULAR_CHARACTER_ALTERNATE_PROFILE_ID = combatantSpear.id;

export const COMBAT_APPEARANCE_PROFILES: Readonly<
  Record<string, CombatAppearanceProfile>
> = Object.freeze({
  [playerSword.id]: playerSword,
  [playerSpear.id]: playerSpear,
  [enemyAxe.id]: enemyAxe,
  [combatant.id]: combatant,
  [combatantSpear.id]: combatantSpear,
  [caster.id]: caster,
  [specialist.id]: specialist,
});

const DEFAULT_PROFILE_ID: Readonly<Record<CombatAppearanceRole, string>> = Object.freeze({
  player: combatant.id,
  enemy: enemyAxe.id,
});

const LAYER_ORDER: readonly CombatAppearanceLayerSlot[] = Object.freeze([
  'body',
  'outfit',
  'mainHand',
  'offHand',
  'accessory',
]);

export function resolveFacingFromGridDelta(
  previous: CombatFacing,
  delta: Readonly<{ x: number; y: number }>,
): CombatFacing {
  if (delta.x !== 0 && delta.y !== 0) {
    throw new RangeError('Combat presentation facing requires an orthogonal grid segment');
  }
  if (delta.x === 0 && delta.y === 0) return previous;
  if (delta.x > 0) return 'east';
  if (delta.x < 0) return 'west';
  return delta.y > 0 ? 'south' : 'north';
}

export function resolveCombatAppearanceProfileFrom(
  profiles: Readonly<Record<string, CombatAppearanceProfile>>,
  defaults: Readonly<Record<CombatAppearanceRole, string>>,
  role: CombatAppearanceRole,
  requestedId?: string | null,
): CombatAppearanceProfile {
  const requested = requestedId ? profiles[requestedId] : undefined;
  if (requested?.role === role) return requested;
  const fallback = profiles[defaults[role]];
  if (!fallback || fallback.role !== role) {
    throw new Error(`Missing default combat appearance profile for role: ${role}`);
  }
  return fallback;
}

export function resolveCombatAppearanceProfile(
  role: CombatAppearanceRole,
  requestedId?: string | null,
): CombatAppearanceProfile {
  return resolveCombatAppearanceProfileFrom(
    COMBAT_APPEARANCE_PROFILES,
    DEFAULT_PROFILE_ID,
    role,
    requestedId,
  );
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
    if (textureKey) layers.push(Object.freeze({ slot, textureKey }));
  }
  return Object.freeze(layers);
}

export function getCombatAppearanceAnimation(
  state: CombatAppearanceState,
): CombatAppearanceAnimation {
  return COMBAT_APPEARANCE_ANIMATIONS[state];
}

export function resolveCombatAppearanceAnimation(
  profile: CombatAppearanceProfile,
  facing: CombatFacing,
  state: CombatAppearanceState,
): CombatAppearanceAnimation {
  return profile.presentation?.[facing].animations[state] ?? getCombatAppearanceAnimation(state);
}

export function resolveCombatAppearanceLayerPresentations(
  profile: CombatAppearanceProfile,
  facing: CombatFacing,
  state: CombatAppearanceState,
): readonly Readonly<{
  slot: CombatAppearanceLayerSlot;
  textureKey: VisualAssetKey;
  animation: CombatAppearanceAnimation;
  flipX: boolean;
}>[] {
  const animation = resolveCombatAppearanceAnimation(profile, facing, state);
  const flipX = profile.presentation?.[facing].flipX ?? false;
  return Object.freeze(resolveCombatAppearanceLayers(profile).map((layer) =>
    Object.freeze({ ...layer, animation, flipX }),
  ));
}

export function getChangedAppearanceSlots(
  before: CombatAppearanceProfile,
  after: CombatAppearanceProfile,
): readonly CombatAppearanceLayerSlot[] {
  return Object.freeze(LAYER_ORDER.filter((slot) => before[slot] !== after[slot]));
}

export function getCombatAppearanceProfileValidationIssues(
  profile: CombatAppearanceProfile,
): readonly string[] {
  const issues: string[] = [];
  if (!profile.id.trim()) issues.push('id');
  if (!profile.body) issues.push('body');
  if (!profile.outfit) issues.push('outfit');
  if (
    profile.nativeUnit !== 16 ||
    profile.displayScale !== 2 ||
    profile.anchor.x !== 0.5 ||
    profile.anchor.y !== 0.9375
  ) {
    issues.push('geometry');
  }
  if (!profile.presentation) {
    issues.push('presentation');
  } else {
    for (const facing of COMBAT_FACINGS) {
      for (const state of COMBAT_APPEARANCE_STATES) {
        if (profile.presentation[facing].animations[state].frames.length === 0) {
          issues.push(`${facing}.${state}`);
        }
      }
    }
  }
  return Object.freeze(issues);
}
