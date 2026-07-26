import Phaser from 'phaser';
import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import { isReducedMotion } from './motionConfig';
import {
  COMBAT_APPEARANCE_PROFILES,
  COMBAT_APPEARANCE_STATES,
  resolveCombatAppearanceLayerPresentations,
  type CombatAppearanceLayerSlot,
  type CombatAppearanceProfile,
  type CombatAppearanceState,
  type CombatFacing,
} from './combatAppearanceProfiles';

export type ActorAnimationRole = 'player' | 'enemy';
export type ActorAnimationState = 'idle' | 'movement' | 'attack' | 'hit' | 'defeat';
export type CombatAppearanceSpriteLayers = Partial<
  Record<CombatAppearanceLayerSlot, Phaser.GameObjects.Sprite>
>;

type ActorAnimationDefinition = Readonly<{
  role: ActorAnimationRole;
  state: ActorAnimationState;
  textureKey: VisualAssetKey;
  frames: readonly number[];
  duration: number;
  repeat: number;
}>;

const DEFINITIONS: readonly ActorAnimationDefinition[] = Object.freeze([
  { role: 'player', state: 'idle', textureKey: VISUAL_ASSET_KEYS.playerActor, frames: [0, 1, 2, 1], duration: 1600, repeat: -1 },
  { role: 'player', state: 'movement', textureKey: VISUAL_ASSET_KEYS.playerActorMovement, frames: [0, 1, 2], duration: 300, repeat: -1 },
  { role: 'player', state: 'attack', textureKey: VISUAL_ASSET_KEYS.playerActorAttack, frames: [0, 1, 2], duration: 250, repeat: 0 },
  { role: 'player', state: 'hit', textureKey: VISUAL_ASSET_KEYS.playerActorHit, frames: [0, 1, 2], duration: 150, repeat: 0 },
  { role: 'player', state: 'defeat', textureKey: VISUAL_ASSET_KEYS.playerActorDefeat, frames: [0, 1, 2], duration: 300, repeat: 0 },
  { role: 'enemy', state: 'idle', textureKey: VISUAL_ASSET_KEYS.enemyActor, frames: [0, 1, 2, 1], duration: 1600, repeat: -1 },
  { role: 'enemy', state: 'attack', textureKey: VISUAL_ASSET_KEYS.enemyActorAttack, frames: [0, 1, 2], duration: 250, repeat: 0 },
  { role: 'enemy', state: 'hit', textureKey: VISUAL_ASSET_KEYS.enemyActorHit, frames: [0, 1, 2], duration: 150, repeat: 0 },
  { role: 'enemy', state: 'defeat', textureKey: VISUAL_ASSET_KEYS.enemyActorDefeat, frames: [0, 1, 2], duration: 300, repeat: 0 },
]);

export function getActorAnimationKey(
  role: ActorAnimationRole,
  state: ActorAnimationState,
): string {
  return `visual.animation.actor.${role}.${state}`;
}

export function createActorAnimations(scene: Phaser.Scene): void {
  for (const definition of DEFINITIONS) {
    if (!scene.textures.exists(definition.textureKey)) continue;

    const animationKey = getActorAnimationKey(definition.role, definition.state);
    if (scene.anims.exists(animationKey)) continue;

    scene.anims.create({
      key: animationKey,
      frames: definition.frames.map((frame) => ({
        key: definition.textureKey,
        frame,
      })),
      duration: definition.duration,
      repeat: definition.repeat,
    });
  }

  for (const profile of Object.values(COMBAT_APPEARANCE_PROFILES)) {
    if (profile.presentation) continue;
    for (const state of COMBAT_APPEARANCE_STATES) {
      for (const definition of buildCombatLayerAnimationDefinitions(profile, state)) {
        registerCombatLayerAnimation(scene, definition);
      }
    }
  }
}

export type CombatLayerAnimationDefinition = Readonly<{
  slot: CombatAppearanceLayerSlot;
  textureKey: VisualAssetKey;
  animationKey: string;
  frames: readonly number[];
  duration: number;
  repeat: number;
  flipX: boolean;
}>;

function registerCombatLayerAnimation(
  scene: Phaser.Scene,
  definition: CombatLayerAnimationDefinition,
): void {
  if (!scene.textures.exists(definition.textureKey)) return;
  if (scene.anims.exists(definition.animationKey)) return;
  scene.anims.create({
    key: definition.animationKey,
    frames: definition.frames.map((frame) => ({
      key: definition.textureKey,
      frame,
    })),
    duration: definition.duration,
    repeat: definition.repeat,
  });
}

export function getCombatLayerAnimationKey(
  profileId: string,
  slot: CombatAppearanceLayerSlot,
  state: CombatAppearanceState,
  facing: CombatFacing = 'south',
): string {
  return `visual.animation.combat.${profileId}.${slot}.${facing}.${state}`;
}

export function buildCombatLayerAnimationDefinitions(
  profile: CombatAppearanceProfile,
  state: CombatAppearanceState,
  facing: CombatFacing = profile.facing,
): readonly CombatLayerAnimationDefinition[] {
  return resolveCombatAppearanceLayerPresentations(profile, facing, state).map(
    ({ slot, textureKey, animation, flipX }) =>
      Object.freeze({
        slot,
        textureKey,
        animationKey: getCombatLayerAnimationKey(profile.id, slot, state, facing),
        frames: animation.frames,
        duration: animation.duration,
        repeat: animation.repeat,
        flipX,
      }),
  );
}

export function playCombatAppearanceAnimation(
  scene: Phaser.Scene,
  sprites: CombatAppearanceSpriteLayers,
  profile: CombatAppearanceProfile,
  state: CombatAppearanceState,
  facing: CombatFacing = profile.facing,
): boolean {
  const definitions = buildCombatLayerAnimationDefinitions(profile, state, facing);
  let played = false;
  for (const definition of definitions) {
    const sprite = sprites[definition.slot];
    if (!sprite) continue;
    sprite.setFlipX(definition.flipX);
    if (isReducedMotion()) {
      sprite.stop();
      sprite.setTexture(
        definition.textureKey,
        definition.frames[definition.frames.length - 1],
      );
      played = true;
      continue;
    }
    registerCombatLayerAnimation(scene, definition);
    if (!scene.anims.exists(definition.animationKey)) continue;
    sprite.play(definition.animationKey, true);
    played = true;
  }
  return played;
}

export function playActorAnimation(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite | undefined,
  role: ActorAnimationRole,
  state: ActorAnimationState,
): boolean {
  if (!sprite) return false;

  const definition = DEFINITIONS.find(
    (item) => item.role === role && item.state === state,
  );
  if (!definition) return false;

  if (isReducedMotion()) {
    sprite.stop();
    sprite.setTexture(definition.textureKey, state === 'idle' ? 1 : 2);
    return true;
  }

  const animationKey = getActorAnimationKey(role, state);
  if (!scene.anims.exists(animationKey)) return false;

  sprite.play(animationKey, true);
  return true;
}
