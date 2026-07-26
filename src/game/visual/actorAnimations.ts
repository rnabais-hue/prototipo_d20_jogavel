import Phaser from 'phaser';
import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import { isReducedMotion } from './motionConfig';
import {
  COMBAT_APPEARANCE_PROFILES,
  getCombatAppearanceAnimation,
  resolveCombatAppearanceLayers,
  type CombatAppearanceLayerSlot,
  type CombatAppearanceProfile,
  type CombatAppearanceState,
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
    for (const state of Object.keys(COMBAT_APPEARANCE_ANIMATIONS) as CombatAppearanceState[]) {
      for (const definition of buildCombatLayerAnimationDefinitions(profile, state)) {
        if (!scene.textures.exists(definition.textureKey)) continue;
        if (scene.anims.exists(definition.animationKey)) continue;
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
    }
  }
}

const COMBAT_APPEARANCE_ANIMATIONS = Object.freeze({
  idle: true,
  movement: true,
  attack: true,
  hit: true,
  defeat: true,
} satisfies Record<CombatAppearanceState, true>);

export type CombatLayerAnimationDefinition = Readonly<{
  slot: CombatAppearanceLayerSlot;
  textureKey: VisualAssetKey;
  animationKey: string;
  frames: readonly number[];
  duration: number;
  repeat: number;
}>;

export function getCombatLayerAnimationKey(
  profileId: string,
  slot: CombatAppearanceLayerSlot,
  state: CombatAppearanceState,
): string {
  return `visual.animation.combat.${profileId}.${slot}.${state}`;
}

export function buildCombatLayerAnimationDefinitions(
  profile: CombatAppearanceProfile,
  state: CombatAppearanceState,
): readonly CombatLayerAnimationDefinition[] {
  const animation = getCombatAppearanceAnimation(state);
  return resolveCombatAppearanceLayers(profile).map(({ slot, textureKey }) =>
    Object.freeze({
      slot,
      textureKey,
      animationKey: getCombatLayerAnimationKey(profile.id, slot, state),
      frames: animation.frames,
      duration: animation.duration,
      repeat: animation.repeat,
    }),
  );
}

export function playCombatAppearanceAnimation(
  scene: Phaser.Scene,
  sprites: CombatAppearanceSpriteLayers,
  profile: CombatAppearanceProfile,
  state: CombatAppearanceState,
): boolean {
  const definitions = buildCombatLayerAnimationDefinitions(profile, state);
  let played = false;
  for (const definition of definitions) {
    const sprite = sprites[definition.slot];
    if (!sprite) continue;
    if (isReducedMotion()) {
      sprite.stop();
      sprite.setTexture(
        definition.textureKey,
        definition.frames[definition.frames.length - 1],
      );
      played = true;
      continue;
    }
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
