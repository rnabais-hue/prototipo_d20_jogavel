import Phaser from 'phaser';
import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import { isReducedMotion } from './motionConfig';

export type ActorAnimationRole = 'player' | 'enemy';
export type ActorAnimationState = 'idle' | 'movement' | 'attack' | 'hit' | 'defeat';

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
