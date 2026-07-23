import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { PhaserCombatantViewHandle } from './combatantViewHandle';

vi.mock('phaser', () => ({ default: {} }));

type TweenConfig = {
  duration: number;
  yoyo?: boolean;
  onComplete?: () => void;
};

const createHarness = () => {
  let now = 0;
  const scheduled: Array<{ completeAt: number; config: TweenConfig }> = [];
  const container = {
    x: 100,
    y: 100,
    setDepth: vi.fn().mockReturnThis(),
    setScrollFactor: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setAngle: vi.fn().mockReturnThis(),
    removeAll: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: { container: vi.fn(() => container) },
    tweens: {
      add: vi.fn((config: TweenConfig) => {
        const listeners = new Map<string, () => void>();
        const tween = {
          on: vi.fn((event: string, callback: () => void) => {
            listeners.set(event, callback);
            return tween;
          }),
          stop: vi.fn(() => listeners.get('stop')?.()),
        };
        scheduled.push({
          completeAt: now + config.duration * (config.yoyo ? 2 : 1),
          config,
        });
        return tween;
      }),
    },
  } as unknown as Phaser.Scene;

  const advanceTo = (targetTime: number) => {
    now = targetTime;
    const due = scheduled.filter((entry) => entry.completeAt <= now);
    for (const entry of due) {
      scheduled.splice(scheduled.indexOf(entry), 1);
      entry.config.onComplete?.();
    }
  };

  return {
    handle: new PhaserCombatantViewHandle(scene, 'target-1', false),
    advanceTo,
    tweenAdd: scene.tweens.add as unknown as ReturnType<typeof vi.fn>,
  };
};

describe('PhaserCombatantViewHandle A5 timings', () => {
  it.each([
    ['hit', (handle: PhaserCombatantViewHandle, callback: () => void) => handle.playHitReaction({ x: 0, y: 100 }, 150, callback)],
    ['miss', (handle: PhaserCombatantViewHandle, callback: () => void) => handle.playMissReaction({ x: 0, y: 100 }, 150, callback)],
  ])('completes the %s reaction at exactly 150 ms', (_label, play) => {
    const { handle, advanceTo, tweenAdd } = createHarness();
    const onComplete = vi.fn();

    play(handle, onComplete);

    expect(tweenAdd).toHaveBeenCalledWith(expect.objectContaining({ duration: 75, yoyo: true }));
    advanceTo(149);
    expect(onComplete).not.toHaveBeenCalled();
    advanceTo(150);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('completes defeat at 300 ms', () => {
    const { handle, advanceTo, tweenAdd } = createHarness();
    const onComplete = vi.fn();

    handle.applyDefeatedPresentation(300, onComplete);

    expect(tweenAdd).toHaveBeenCalledWith(expect.objectContaining({
      duration: 300,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
    }));
    advanceTo(299);
    expect(onComplete).not.toHaveBeenCalled();
    advanceTo(300);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
