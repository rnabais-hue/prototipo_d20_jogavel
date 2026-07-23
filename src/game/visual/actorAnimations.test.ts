import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import {
  createActorAnimations,
  getActorAnimationKey,
  playActorAnimation,
} from './actorAnimations';

vi.mock('phaser', () => ({ default: {} }));

function createSceneHarness() {
  const created = new Map<string, Phaser.Types.Animations.Animation>();
  const scene = {
    textures: { exists: vi.fn(() => true) },
    anims: {
      exists: vi.fn((key: string) => created.has(key)),
      create: vi.fn((config: Phaser.Types.Animations.Animation) => {
        created.set(config.key!, config);
        return config;
      }),
    },
  } as unknown as Phaser.Scene;

  return { scene, created };
}

describe('A7 actor animations', () => {
  it('registers only the nine approved player and enemy states', () => {
    const { scene, created } = createSceneHarness();

    createActorAnimations(scene);

    expect(created.size).toBe(9);
    expect(created.has(getActorAnimationKey('player', 'movement'))).toBe(true);
    expect([...created.keys()].some((key) => key.includes('enemy.movement'))).toBe(false);
    expect(created.get(getActorAnimationKey('player', 'attack'))).toMatchObject({
      duration: 250,
      repeat: 0,
    });
    expect(created.get(getActorAnimationKey('enemy', 'defeat'))).toMatchObject({
      duration: 300,
      repeat: 0,
    });
  });

  it('is idempotent and plays an available animation by semantic state', () => {
    const { scene } = createSceneHarness();
    const sprite = { play: vi.fn() } as unknown as Phaser.GameObjects.Sprite;

    createActorAnimations(scene);
    createActorAnimations(scene);

    expect(scene.anims.create).toHaveBeenCalledTimes(9);
    expect(playActorAnimation(scene, sprite, 'enemy', 'hit')).toBe(true);
    expect(sprite.play).toHaveBeenCalledWith(
      getActorAnimationKey('enemy', 'hit'),
      true,
    );
  });
});
