import { describe, expect, it, vi } from 'vitest';
import { drawExplorationInterestPoints } from './drawExplorationInterestPoints';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { createInterestPoint } from '../../exploration/interestPoint';
import Phaser from 'phaser';

vi.mock('phaser', () => {
  return {
    default: {
      GameObjects: {
        Container: class {
          scene: any;
          list: any[] = [];
          constructor(scene: any) {
            this.scene = scene;
          }
          add(item: any) {
            this.list.push(item);
          }
          removeAll() {
            this.list = [];
          }
        },
        Sprite: class {
          x: number;
          y: number;
          key: string;
          frame: number | string = 0;
          originX = 0;
          originY = 0;
          displayWidth = 0;
          displayHeight = 0;
          constructor(scene: any, x: number, y: number, key: string) {
            this.x = x;
            this.y = y;
            this.key = key;
          }
          setOrigin(x: number, y: number) {
            this.originX = x;
            this.originY = y;
            return this;
          }
          setDisplaySize(w: number, h: number) {
            this.displayWidth = w;
            this.displayHeight = h;
            return this;
          }
          setFrame(f: number | string) {
            this.frame = f;
            return this;
          }
        },
        Graphics: class {
          scene: any;
          constructor(scene: any) {
            this.scene = scene;
          }
          clear() {}
          fillStyle() {}
          lineStyle() {}
          fillRect() {}
          strokeRect() {}
          fillCircle() {}
          strokeCircle() {}
          lineBetween() {}
          beginPath() {}
          moveTo() {}
          lineTo() {}
          strokePath() {}
        }
      }
    }
  };
});

describe('drawExplorationInterestPoints Phaser renderer', () => {
  it('maps switch state correctly to frames 0 (OFF) and 1 (ON) when rendering textures', () => {
    // Setup Phaser mock scene objects
    const spriteMockCalls: any[] = [];
    const mockScene = {
      textures: {
        exists: () => true, // Mock that textures exist for switchPoint
      },
      add: {
        sprite(x: number, y: number, key: string) {
          const s = new Phaser.GameObjects.Sprite(mockScene as any, x, y, key);
          spriteMockCalls.push(s);
          return s;
        },
        graphics() {
          return new Phaser.GameObjects.Graphics(mockScene as any);
        }
      }
    };
    
    const mockContainer = new Phaser.GameObjects.Container(mockScene as any);
    mockContainer.scene = mockScene as any;

    const switchInactive = createInterestPoint('poi-switch-1', 'Lever Switch', { x: 5, y: 5 }, 'switch');
    switchInactive.debugFlagActive = false;

    const switchActive = createInterestPoint('poi-switch-2', 'Lever Switch', { x: 6, y: 5 }, 'switch');
    switchActive.debugFlagActive = true;

    drawExplorationInterestPoints(mockContainer as any, [switchInactive, switchActive]);

    expect(spriteMockCalls).toHaveLength(2);
    expect(spriteMockCalls[0].key).toBe(VISUAL_ASSET_KEYS.switchPoint);
    expect(spriteMockCalls[0].frame).toBe(0); // OFF frame

    expect(spriteMockCalls[1].key).toBe(VISUAL_ASSET_KEYS.switchPoint);
    expect(spriteMockCalls[1].frame).toBe(1); // ON frame
  });

  it('maps exit portal visual states correctly to frame 0 (locked), 1 (available) and 2 (completed)', () => {
    const spriteMockCalls: any[] = [];
    const mockScene = {
      textures: {
        exists: () => true, // Mock that exitPoint texture exists
      },
      add: {
        sprite(x: number, y: number, key: string) {
          const s = new Phaser.GameObjects.Sprite(mockScene as any, x, y, key);
          spriteMockCalls.push(s);
          return s;
        },
        graphics() {
          return new Phaser.GameObjects.Graphics(mockScene as any);
        }
      }
    };

    const mockContainer = new Phaser.GameObjects.Container(mockScene as any);
    mockContainer.scene = mockScene as any;

    // 1. Locked portal: required switch is inactive
    const exitPortalLocked = createInterestPoint('poi-exit-1', 'Exit Portal', { x: 10, y: 1 }, 'exit_marker');
    const switchForExitInactive = createInterestPoint('poi-switch-1', 'Switch', { x: 9, y: 9 }, 'switch');
    switchForExitInactive.debugFlagActive = false;

    spriteMockCalls.length = 0;
    drawExplorationInterestPoints(mockContainer as any, [exitPortalLocked, switchForExitInactive]);
    const lockedSprite = spriteMockCalls.find(s => s.key === VISUAL_ASSET_KEYS.exitPoint);
    expect(lockedSprite).toBeDefined();
    expect(lockedSprite.frame).toBe(0); // Locked Frame

    // 2. Available portal: required switch is active
    const exitPortalAvailable = createInterestPoint('poi-exit-1', 'Exit Portal', { x: 10, y: 2 }, 'exit_marker');
    const switchForExitActive = createInterestPoint('poi-switch-1', 'Switch', { x: 9, y: 10 }, 'switch');
    switchForExitActive.debugFlagActive = true;

    spriteMockCalls.length = 0;
    drawExplorationInterestPoints(mockContainer as any, [exitPortalAvailable, switchForExitActive]);
    const availSprite = spriteMockCalls.find(s => s.key === VISUAL_ASSET_KEYS.exitPoint);
    expect(availSprite).toBeDefined();
    expect(availSprite.frame).toBe(1); // Available Frame

    // 3. Completed portal: exit portal is inspected (completed)
    const exitPortalCompleted = createInterestPoint('poi-exit-1', 'Exit Portal', { x: 10, y: 3 }, 'exit_marker');
    exitPortalCompleted.state = 'inspected';
    // Switch is also active
    const switchForExitActiveCompleted = createInterestPoint('poi-switch-1', 'Switch', { x: 9, y: 10 }, 'switch');
    switchForExitActiveCompleted.debugFlagActive = true;

    spriteMockCalls.length = 0;
    drawExplorationInterestPoints(mockContainer as any, [exitPortalCompleted, switchForExitActiveCompleted]);
    const completedSprite = spriteMockCalls.find(s => s.key === VISUAL_ASSET_KEYS.exitPoint);
    expect(completedSprite).toBeDefined();
    expect(completedSprite.frame).toBe(2); // Completed Frame
  });
});
