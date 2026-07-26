import { describe, expect, it, vi } from 'vitest';
import { VISUAL_ASSET_KEYS } from '../visual/assetKeys';
import { PrototypeScene } from './PrototypeScene';

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
  },
}));

describe('PrototypeScene visual asset preload boundary', () => {
  it('queues approved assets but not revision-requested A6 UI candidates', () => {
    const image = vi.fn();
    const spritesheet = vi.fn();
    const tilemapTiledJSON = vi.fn();
    const scene = {
      load: {
        image,
        spritesheet,
        tilemapTiledJSON,
      },
    } as unknown as PrototypeScene;

    PrototypeScene.prototype.preload.call(scene);

    expect(tilemapTiledJSON).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.combatArenaMap,
      '/assets/terrain/combat/pixel/combat-arena.json',
    );
    expect(image).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.combatPixelTiles,
      '/assets/terrain/combat/pixel/combat-dungeon-tiles.png',
    );
    expect(spritesheet).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.combatPlayerBody,
      '/assets/actors/combat/player/combat-player-body.png',
      { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 19 },
    );

    expect(image.mock.calls).toEqual(expect.arrayContaining([
      [
        VISUAL_ASSET_KEYS.explorationGround,
        '/assets/terrain/exploration/abandoned-temple-floor-e2p1.png',
      ],
      [
        VISUAL_ASSET_KEYS.combatGround,
        '/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png',
      ],
      [
        VISUAL_ASSET_KEYS.combatPixelTiles,
        '/assets/terrain/combat/pixel/combat-dungeon-tiles.png',
      ],
      [
        VISUAL_ASSET_KEYS.wallObstacle,
        '/assets/world/obstacles/A4-wall-W1R1-master.png',
      ],
      [
        VISUAL_ASSET_KEYS.encounterPoint,
        '/assets/world/points-of-interest/A4-encounter-E1R2-master.png',
      ],
      [
        VISUAL_ASSET_KEYS.attackEffect,
        '/assets/effects/attacks/A5-attack-effect.png',
      ],
      [
        VISUAL_ASSET_KEYS.damageEffect,
        '/assets/effects/impacts/A5-damage-effect.png',
      ],
      [
        VISUAL_ASSET_KEYS.defeatEffect,
        '/assets/effects/defeat/A5-defeat-effect.png',
      ],
    ]));

    expect(spritesheet.mock.calls).toEqual(expect.arrayContaining([
      [
        VISUAL_ASSET_KEYS.playerActor,
        '/assets/actors/player/A7-player-idle-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.playerActorMovement,
        '/assets/actors/player/A7-player-movement-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.playerActorAttack,
        '/assets/actors/player/A7-player-attack-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.playerActorHit,
        '/assets/actors/player/A7-player-hit-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.playerActorDefeat,
        '/assets/actors/player/A7-player-defeat-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.enemyActor,
        '/assets/actors/enemies/A7-enemy-idle-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.enemyActorAttack,
        '/assets/actors/enemies/A7-enemy-attack-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.enemyActorHit,
        '/assets/actors/enemies/A7-enemy-hit-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.enemyActorDefeat,
        '/assets/actors/enemies/A7-enemy-defeat-3f-256.png',
        { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
      ],
      [
        VISUAL_ASSET_KEYS.switchPoint,
        '/assets/world/points-of-interest/A4-switch-S1R1-spritesheet.png',
        { frameWidth: 144, frameHeight: 144 },
      ],
      [
        VISUAL_ASSET_KEYS.exitPoint,
        '/assets/world/points-of-interest/A4-exit-X1R1-spritesheet.png',
        { frameWidth: 192, frameHeight: 192 },
      ],
    ]));
  });
});
