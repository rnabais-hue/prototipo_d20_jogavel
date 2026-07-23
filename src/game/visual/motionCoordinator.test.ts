import { describe, expect, it, vi } from 'vitest';
import { MotionCoordinator } from './motionCoordinator';
import type { PresentationEvent } from './presentationEvents';
import type { CombatSession } from '../../combat/combatSession';
import { setReducedMotion } from './motionConfig';
import type { CombatantViewHandle } from './combatantViewHandle';
import type { DebugCombatGridView } from '../debug/debugCombatGridView';
import type Phaser from 'phaser';

// Mock Timer Event matching Phaser's TimerEvent shape
class MockTimerEvent {
  destroyed = false;
  destroy() {
    this.destroyed = true;
  }
}

const createMockScene = () => {
  let timerCallback: (() => void) | undefined = undefined;
  let activeTimer: MockTimerEvent | undefined = undefined;

  const mockTextObj = {
    setOrigin: vi.fn().mockReturnThis(),
    setScrollFactor: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockGraphicsObj = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    setScrollFactor: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setRotation: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    beginPath: vi.fn().mockReturnThis(),
    arc: vi.fn().mockReturnThis(),
    strokePath: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockSpriteObj = {
    setOrigin: vi.fn().mockReturnThis(),
    setDisplaySize: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setRotation: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockAdd = {
    text: vi.fn(() => mockTextObj as unknown as Phaser.GameObjects.Text),
    graphics: vi.fn(() => mockGraphicsObj as unknown as Phaser.GameObjects.Graphics),
    sprite: vi.fn(() => mockSpriteObj as unknown as Phaser.GameObjects.Sprite),
  };

  const mockTime = {
    delayedCall: vi.fn((duration: number, callback: () => void) => {
      timerCallback = callback;
      activeTimer = new MockTimerEvent();
      return activeTimer as unknown as Phaser.Time.TimerEvent;
    }),
  };

  const mockTweens = {
    add: vi.fn((config: { onComplete?: () => void }) => {
      if (config.onComplete) {
        config.onComplete();
      }
      return {} as unknown as Phaser.Tweens.Tween;
    }),
  };

  const mockScene = {
    add: mockAdd,
    time: mockTime,
    tweens: mockTweens,
    scale: {
      width: 800,
      height: 600,
    },
    textures: {
      exists: vi.fn(() => false),
    },
  };

  return {
    scene: mockScene as unknown as Phaser.Scene,
    triggerTimer: () => {
      if (timerCallback) {
        const cb = timerCallback;
        timerCallback = undefined;
        activeTimer = undefined;
        cb();
      }
    },
    getActiveTimer: () => activeTimer,
  };
};

const createMockGridView = () => {
  const mockHandles = new Map<string, CombatantViewHandle>();
  const snapAllMock = vi.fn();

  const gridView = {
    getHandle: vi.fn((id: string) => mockHandles.get(id)),
    snapAll: snapAllMock,
  };

  return {
    gridView: gridView as unknown as DebugCombatGridView,
    snapAllMock,
    setHandle: (id: string, handle: CombatantViewHandle) => mockHandles.set(id, handle),
  };
};

interface TestHandle extends CombatantViewHandle {
  lastAnticipationCb?: () => void;
  lastHitCb?: () => void;
  lastMissCb?: () => void;
  lastDefeatedCb?: () => void;
}

const createMockHandle = (id: string, isPlayer: boolean): TestHandle => {
  const containerMock = {
    x: 100,
    y: 100,
    setScale: vi.fn().mockReturnThis(),
    setAngle: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
  };

  const handle: TestHandle = {
    participantId: id,
    isPlayer,
    container: containerMock as unknown as Phaser.GameObjects.Container,
    activeTweens: [],
    projectAuthoritativePosition: vi.fn(() => ({ x: 100, y: 100 })),
    animatePresentationPosition: vi.fn(),
    playAnticipation: vi.fn((target: { x: number; y: number }, dur: number, cb?: () => void) => {
      handle.lastAnticipationCb = cb;
    }),
    playLunge: vi.fn(),
    playHitReaction: vi.fn((attacker: { x: number; y: number }, dur: number, cb?: () => void) => {
      handle.lastHitCb = cb;
    }),
    playMissReaction: vi.fn((attacker: { x: number; y: number }, dur: number, cb?: () => void) => {
      handle.lastMissCb = cb;
    }),
    prepareForDefeatAnimation: vi.fn(),
    applyDefeatedPresentation: vi.fn((dur: number, cb?: () => void) => {
      handle.lastDefeatedCb = cb;
    }),
    snapToAuthoritativeState: vi.fn(),
    cancelActiveTweens: vi.fn(),
    destroy: vi.fn(),
  };
  return handle;
};

// Mock CombatSession cast safely for pure signature matching
const mockSession = {} as unknown as CombatSession;

describe('MotionCoordinator sequencing and cancellation lifecycle', () => {
  it('runs a normal event sequence and reaches idle state', () => {
    setReducedMotion(false); // force normal motion

    const { scene, triggerTimer } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    const events: PresentationEvent[] = [
      {
        type: 'combatant_move',
        participantId: 'attacker-1',
        fromCell: { x: 1, y: 1 },
        toCell: { x: 2, y: 1 },
      },
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'crossbow',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 4,
        isDefeated: false,
      },
    ];

    let sequenceCompleted = false;
    coordinator.play(events, () => {
      sequenceCompleted = true;
    });

    // 1. Started playing, is playing movement timer
    expect(coordinator.isPlaying).toBe(true);
    expect(scene.time.delayedCall).toHaveBeenCalledTimes(1);

    // Trigger timer to complete move event
    triggerTimer();

    // 2. Play anticipation
    expect(attacker.playAnticipation).toHaveBeenCalledTimes(1);
    expect(attacker.lastAnticipationCb).toBeDefined();

    // Trigger anticipation callback
    attacker.lastAnticipationCb!();

    // 3. Play hit reaction
    expect(target.playHitReaction).toHaveBeenCalledTimes(1);
    expect(target.lastHitCb).toBeDefined();

    // Trigger hit reaction callback
    target.lastHitCb!();

    // 4. Completed all events, coordinator returns to idle
    expect(coordinator.isPlaying).toBe(false);
    expect(sequenceCompleted).toBe(true);
  });

  it('correctly cancels sequences and invalidates stale completion callbacks', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle, snapAllMock } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    // Queue up anticipation and hit
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'bow',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 5,
        isDefeated: false,
      },
    ]);

    expect(coordinator.isPlaying).toBe(true);
    expect(attacker.playAnticipation).toHaveBeenCalledTimes(1);
    const staleCallback = attacker.lastAnticipationCb;
    expect(staleCallback).toBeDefined();

    // Reset/Cancel all events
    coordinator.cancelAll(mockSession);
    expect(coordinator.isPlaying).toBe(false);
    expect(snapAllMock).toHaveBeenCalledTimes(1);

    // Triggering the stale callback from the cancelled sequence must NOT resume playback
    staleCallback!();
    expect(coordinator.isPlaying).toBe(false);
    expect(target.playHitReaction).toHaveBeenCalledTimes(0);
  });

  it('destroys and removes tracked delayed timers on cancel', () => {
    setReducedMotion(false);

    const { scene, getActiveTimer } = createMockScene();
    const { gridView } = createMockGridView();

    const coordinator = new MotionCoordinator(scene, gridView);

    coordinator.play([
      {
        type: 'combatant_move',
        participantId: 'player-1',
        fromCell: { x: 0, y: 0 },
        toCell: { x: 1, y: 0 },
      },
    ]);

    expect(coordinator.isPlaying).toBe(true);
    const timer = getActiveTimer();
    expect(timer).toBeDefined();
    expect(timer?.destroyed).toBe(false);

    // Cancel
    coordinator.cancelAll(mockSession);
    expect(timer?.destroyed).toBe(true);
  });

  it('completes the entire sequence synchronously when reduced motion is enabled', () => {
    setReducedMotion(true); // Enable reduced motion (all timings 0 ms)

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    const events: PresentationEvent[] = [
      {
        type: 'combatant_move',
        participantId: 'attacker-1',
        fromCell: { x: 1, y: 1 },
        toCell: { x: 2, y: 1 },
      },
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'sword',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 10,
        isDefeated: true,
      },
      {
        type: 'combatant_defeated',
        participantId: 'target-1',
      },
    ];

    let completed = false;
    coordinator.play(events, () => {
      completed = true;
    });

    // Timing is 0ms, so it executes instantly
    expect(coordinator.isPlaying).toBe(false);
    expect(completed).toBe(true);
  });

  it('recovers and processes a new sequence normally after resize-style cancellation', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    // 1. Start an anticipation + hit sequence
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'bow',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 5,
        isDefeated: false,
      },
    ]);

    expect(coordinator.isPlaying).toBe(true);
    expect(attacker.playAnticipation).toHaveBeenCalledTimes(1);

    // 2. Retain the anticipation callback as stale
    const staleCallback = attacker.lastAnticipationCb;
    expect(staleCallback).toBeDefined();

    // 3. Call cancelAll
    coordinator.cancelAll(mockSession);

    // 4. Assert isPlaying is false
    expect(coordinator.isPlaying).toBe(false);

    // 5. Invoke the stale callback
    staleCallback!();

    // 6. Assert it does not resume the old hit
    expect(coordinator.isPlaying).toBe(false);
    expect(target.playHitReaction).toHaveBeenCalledTimes(0);

    // 7. Start a new sequence
    let newSequenceCompleted = false;
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'crossbow',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 3,
        isDefeated: false,
      },
    ], () => {
      newSequenceCompleted = true;
    });

    expect(coordinator.isPlaying).toBe(true);
    expect(attacker.playAnticipation).toHaveBeenCalledTimes(2);

    // 8. Complete its callbacks
    const newAnticipationCb = attacker.lastAnticipationCb;
    expect(newAnticipationCb).toBeDefined();
    newAnticipationCb!();

    expect(target.playHitReaction).toHaveBeenCalledTimes(1);
    const newHitCb = target.lastHitCb;
    expect(newHitCb).toBeDefined();
    newHitCb!();

    // 9. Assert the new sequence reaches idle normally
    expect(coordinator.isPlaying).toBe(false);
    expect(newSequenceCompleted).toBe(true);
  });

  it('spawns transient visual effects or fallback graphics during events based on texture availability', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();
    
    // Mock textures exists to return true (texture loaded mode)
    (scene.textures.exists as any).mockReturnValue(true);

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    // 1. Play anticipation event
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'sword',
      },
    ]);

    // Expect sprite to be created since texture exists
    expect(scene.add.sprite).toHaveBeenCalled();
  });

  it('rejects invalid presentation sequence containing miss + defeat on same target', () => {
    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    const invalidEvents: PresentationEvent[] = [
      {
        type: 'attack_miss',
        attackerId: 'attacker-1',
        targetId: 'target-1',
      },
      {
        type: 'combatant_defeated',
        participantId: 'target-1',
      },
    ];

    expect(() => coordinator.play(invalidEvents)).toThrowError(
      'Invalid presentation event sequence: target target-1 cannot be defeated after a miss'
    );
  });

  it('runs multiple consecutive queues correctly', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    let completed1 = false;
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'sword',
      },
    ], () => { completed1 = true; });

    attacker.lastAnticipationCb!();
    expect(completed1).toBe(true);

    let completed2 = false;
    coordinator.play([
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 5,
        isDefeated: false,
      },
    ], () => { completed2 = true; });

    target.lastHitCb!();
    expect(completed2).toBe(true);
  });

  it('keeps a lethally hit target visible until the defeat event starts', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();
    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    let targetVisible = false;

    target.prepareForDefeatAnimation = vi.fn(() => {
      targetVisible = true;
    });
    target.playHitReaction = vi.fn((_attackerWorld, duration, callback) => {
      expect(targetVisible).toBe(true);
      expect(duration).toBe(150);
      target.lastHitCb = callback;
    });
    target.applyDefeatedPresentation = vi.fn((duration, callback) => {
      expect(targetVisible).toBe(true);
      expect(duration).toBe(300);
      targetVisible = false;
      target.lastDefeatedCb = callback;
    });

    setHandle('attacker-1', attacker);
    setHandle('target-1', target);
    const coordinator = new MotionCoordinator(scene, gridView);

    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'sword',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 10,
        isDefeated: true,
      },
      {
        type: 'combatant_defeated',
        participantId: 'target-1',
      },
    ]);

    expect(target.prepareForDefeatAnimation).toHaveBeenCalledOnce();
    expect(targetVisible).toBe(true);
    expect(attacker.playAnticipation).toHaveBeenCalledOnce();

    attacker.lastAnticipationCb!();
    expect(target.playHitReaction).toHaveBeenCalledOnce();
    expect(targetVisible).toBe(true);

    target.lastHitCb!();
    expect(target.applyDefeatedPresentation).toHaveBeenCalledOnce();
    expect(targetVisible).toBe(false);

    target.lastDefeatedCb!();
    expect(coordinator.isPlaying).toBe(false);
  });

  it('does not prepare a queued lethal target before its own anticipation starts', () => {
    setReducedMotion(false);

    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();
    const firstAttacker = createMockHandle('attacker-1', true);
    const firstTarget = createMockHandle('target-1', false);
    const secondAttacker = createMockHandle('attacker-2', true);
    const secondTarget = createMockHandle('target-2', false);
    setHandle('attacker-1', firstAttacker);
    setHandle('target-1', firstTarget);
    setHandle('attacker-2', secondAttacker);
    setHandle('target-2', secondTarget);

    const coordinator = new MotionCoordinator(scene, gridView);
    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        weaponId: 'sword',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 3,
        isDefeated: false,
      },
    ]);

    coordinator.play([
      {
        type: 'attack_anticipation',
        attackerId: 'attacker-2',
        targetId: 'target-2',
        weaponId: 'sword',
      },
      {
        type: 'attack_hit',
        attackerId: 'attacker-2',
        targetId: 'target-2',
        damageAmount: 10,
        isDefeated: true,
      },
      {
        type: 'combatant_defeated',
        participantId: 'target-2',
      },
    ]);

    expect(secondTarget.prepareForDefeatAnimation).not.toHaveBeenCalled();

    firstAttacker.lastAnticipationCb!();
    expect(secondTarget.prepareForDefeatAnimation).not.toHaveBeenCalled();

    firstTarget.lastHitCb!();
    expect(secondAttacker.playAnticipation).toHaveBeenCalledOnce();
    expect(secondTarget.prepareForDefeatAnimation).toHaveBeenCalledOnce();
  });

  it('cleans up all active transient effects upon cancelAll', () => {
    const { scene } = createMockScene();
    const { gridView, setHandle } = createMockGridView();

    const attacker = createMockHandle('attacker-1', true);
    const target = createMockHandle('target-1', false);
    setHandle('attacker-1', attacker);
    setHandle('target-1', target);

    const coordinator = new MotionCoordinator(scene, gridView);

    coordinator.play([
      {
        type: 'attack_hit',
        attackerId: 'attacker-1',
        targetId: 'target-1',
        damageAmount: 4,
        isDefeated: false,
      },
    ]);

    // Floating text textObj and graphics recoil fallback created
    expect(scene.add.text).toHaveBeenCalled();
    
    // Call cancelAll
    coordinator.cancelAll(mockSession);
    
    // Verify cleanup
    const textObj = (scene.add.text as any).mock.results[0].value;
    expect(textObj.destroy).toHaveBeenCalled();
  });
});
