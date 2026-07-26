import Phaser from 'phaser';
import type { PresentationEvent } from './presentationEvents';
import type { DebugCombatGridView } from '../debug/debugCombatGridView';
import type { CombatSession } from '../../combat/combatSession';
import { getCombatMoveDuration, getMotionDuration } from './motionConfig';
import { spawnFloatingText } from '../debug/debugCombatFloatingText';
import { flashOverlay } from '../debug/debugCombatFlash';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';

export type MotionCoordinatorCallbacks = {
  updateHpBars: () => void;
  updateTurnIndicator: () => void;
  showOutcomeBanner: (status: 'victory' | 'defeat') => void;
  logToConsole: (message: string) => void;
};

export class MotionCoordinator {
  private scene: Phaser.Scene;
  private gridView: DebugCombatGridView;
  private queue: PresentationEvent[] = [];
  public isPlaying = false;
  private transientEffects: { destroy: () => void }[] = [];
  private callbacks?: MotionCoordinatorCallbacks;

  // Invalidation token for sequences
  private currentSequenceId = 0;
  // Track active delayed call timer
  private activeTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, gridView: DebugCombatGridView, callbacks?: MotionCoordinatorCallbacks) {
    this.scene = scene;
    this.gridView = gridView;
    this.callbacks = callbacks;
  }

  /**
   * Set or update coordinator callbacks.
   */
  setCallbacks(callbacks: MotionCoordinatorCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Queue and execute a sequence of presentation events.
   */
  play(events: PresentationEvent[], onSequenceComplete?: () => void): void {
    // Validate that we don't have a miss followed by defeat for the same target
    let activeMissTargetId: string | null = null;
    for (const event of events) {
      if (event.type === 'attack_miss') {
        activeMissTargetId = event.targetId;
      } else if (event.type === 'attack_hit') {
        if (event.targetId === activeMissTargetId) {
          activeMissTargetId = null;
        }
      } else if (event.type === 'combatant_defeated') {
        if (event.participantId === activeMissTargetId) {
          throw new Error(`Invalid presentation event sequence: target ${event.participantId} cannot be defeated after a miss`);
        }
      }
    }

    this.queue.push(...events);
    if (!this.isPlaying) {
      this.currentSequenceId += 1;
      this.playNext(this.currentSequenceId, onSequenceComplete);
    }
  }

  /**
   * Cancel all active tweens, clear the queue, flush transient effects, and snap handles to authoritative cells.
   */
  cancelAll(session: CombatSession): void {
    // Invalidate any ongoing callbacks by incrementing the sequence ID
    this.currentSequenceId += 1;
    this.queue = [];
    this.isPlaying = false;

    // Clear active timer if running
    if (this.activeTimer) {
      this.activeTimer.destroy();
      this.activeTimer = undefined;
    }

    // Destroy all transient effects (flashes, floating texts)
    this.transientEffects.forEach((effect) => {
      try {
        effect.destroy();
      } catch (e) {
        // ignore
      }
    });
    this.transientEffects = [];

    // Stop active combatant tweens and snap them to authoritative positions
    this.gridView.snapAll(session);
  }

  private addTransientEffect(effect: { destroy: () => void }): void {
    this.transientEffects.push(effect);
  }

  private removeTransientEffect(effect: { destroy: () => void }): void {
    this.transientEffects = this.transientEffects.filter((e) => e !== effect);
  }

  private playNext(sequenceId: number, onSequenceComplete?: () => void): void {
    // Stale sequence invalidation check
    if (this.currentSequenceId !== sequenceId) {
      return;
    }

    if (this.queue.length === 0) {
      this.isPlaying = false;
      onSequenceComplete?.();
      return;
    }

    this.isPlaying = true;
    const event = this.queue.shift()!;

    // Clear previous timer just in case
    if (this.activeTimer) {
      this.activeTimer.destroy();
      this.activeTimer = undefined;
    }

    const next = () => {
      if (this.currentSequenceId === sequenceId) {
        this.playNext(sequenceId, onSequenceComplete);
      }
    };

    switch (event.type) {
      case 'combatant_move': {
        const duration = getCombatMoveDuration(event.fromCell, event.toCell);
        if (duration <= 0) {
          next();
        } else {
          this.activeTimer = this.scene.time.delayedCall(duration, () => {
            this.activeTimer = undefined;
            next();
          });
        }
        break;
      }

      case 'attack_anticipation': {
        const attacker = this.gridView.getHandle(event.attackerId);
        const target = this.gridView.getHandle(event.targetId);
        const duration = getMotionDuration('anticipation');
        const pendingHit = this.queue[0];
        const pendingRecovery = this.queue[1];
        const pendingDefeat = this.queue[2];
        const startsLethalSequence =
          pendingHit?.type === 'attack_hit' &&
          pendingHit.targetId === event.targetId &&
          pendingHit.isDefeated &&
          pendingRecovery?.type === 'attack_recovery' &&
          pendingRecovery.attackerId === event.attackerId &&
          pendingDefeat?.type === 'combatant_defeated' &&
          pendingDefeat.participantId === event.targetId;

        if (startsLethalSequence) {
          target?.prepareForDefeatAnimation();
        }

        if (!attacker || !target || duration <= 0) {
          next();
        } else {
          const targetWorld = {
            x: Math.round(target.container.x),
            y: Math.round(target.container.y),
          };

          attacker.playAnticipation(targetWorld, duration, () => {
            next();
          });
        }
        break;
      }

      case 'attack_hit': {
        const attacker = this.gridView.getHandle(event.attackerId);
        const target = this.gridView.getHandle(event.targetId);
        const duration = getMotionDuration('hitReaction');

        // Spawn target-local floating text using TDZ-safe reference holder
        if (target) {
          const textX = Math.round(target.container.x);
          const textY = Math.round(target.container.y - 20);
          const textRef = { destroy: () => {} };
          const textHandle = spawnFloatingText(this.scene, {
            text: `-${event.damageAmount} HP`,
            x: textX,
            y: textY,
            color: '#ff6b4a',
            duration: 500,
            onComplete: () => {
              this.removeTransientEffect(textRef);
            },
          });
          textRef.destroy = () => textHandle.destroy();
          this.addTransientEffect(textRef);
          
          const impact = this.scene.add.graphics();
          impact
            .setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1)
            .setPosition(textX, Math.round(target.container.y))
            .setAlpha(0)
            .fillStyle(0xffd166, 1)
            .fillRect(-12, -2, 24, 4)
            .fillRect(-2, -12, 4, 24)
            .fillStyle(0xff6b4a, 1)
            .fillRect(-6, -6, 12, 12);
          const impactRef = { destroy: () => impact.destroy() };
          this.addTransientEffect(impactRef);
          this.scene.tweens.add({
            targets: impact,
            alpha: { from: 1, to: 0 },
            duration: 160,
            onComplete: () => {
              this.removeTransientEffect(impactRef);
              impact.destroy();
            },
          });
        }

        // Trigger half-screen flash as secondary indicator
        const isPlayerAttacking = attacker?.isPlayer ?? false;
        const flashColor = isPlayerAttacking ? 0xa3e635 : 0xef4444;
        const flashAlpha = isPlayerAttacking ? 0.15 : 0.2;
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const flashX = isPlayerAttacking ? Math.round(width * 0.5) : 0;
        const flashRef = { destroy: () => {} };
        const flashHandle = flashOverlay(this.scene, {
          color: flashColor,
          alpha: flashAlpha,
          duration: 200,
          x: flashX,
          y: 0,
          width: Math.round(width * 0.5),
          height: height,
          onComplete: () => {
            this.removeTransientEffect(flashRef);
          },
        });
        flashRef.destroy = () => flashHandle.destroy();
        this.addTransientEffect(flashRef);

        // Update HP bar smoothly on impact
        this.callbacks?.updateHpBars();

        if (!target || !attacker || duration <= 0) {
          next();
        } else {
          const targetWorld = { x: Math.round(target.container.x), y: Math.round(target.container.y) };
          attacker.playLunge(targetWorld, duration);

          const attackerWorld = { x: Math.round(attacker.container.x), y: Math.round(attacker.container.y) };
          target.playHitReaction(attackerWorld, duration, () => {
            next();
          });
        }
        break;
      }

      case 'attack_miss': {
        const attacker = this.gridView.getHandle(event.attackerId);
        const target = this.gridView.getHandle(event.targetId);
        const duration = getMotionDuration('missEvade');

        // Spawn target-local floating MISS text using TDZ-safe reference holder
        if (target) {
          const textX = Math.round(target.container.x);
          const textY = Math.round(target.container.y - 20);
          const textRef = { destroy: () => {} };
          const textHandle = spawnFloatingText(this.scene, {
            text: 'MISS',
            x: textX,
            y: textY,
            color: '#8fb8de',
            duration: 500,
            onComplete: () => {
              this.removeTransientEffect(textRef);
            },
          });
          textRef.destroy = () => textHandle.destroy();
          this.addTransientEffect(textRef);
        }

        if (!target || !attacker || duration <= 0) {
          next();
        } else {
          const targetWorld = { x: Math.round(target.container.x), y: Math.round(target.container.y) };
          attacker.playLunge(targetWorld, duration);

          const attackerWorld = { x: Math.round(attacker.container.x), y: Math.round(attacker.container.y) };
          target.playMissReaction(attackerWorld, duration, () => {
            next();
          });
        }
        break;
      }

      case 'attack_recovery': {
        const attacker = this.gridView.getHandle(event.attackerId);
        const duration = getMotionDuration('recovery');
        if (!attacker || duration <= 0) {
          next();
        } else {
          attacker.playRecovery(duration, next);
        }
        break;
      }

      case 'healing_applied': {
        const target = this.gridView.getHandle(event.participantId);

        if (target) {
          const textX = Math.round(target.container.x);
          const textY = Math.round(target.container.y - 20);
          const textRef = { destroy: () => {} };
          const textHandle = spawnFloatingText(this.scene, {
            text: `+${event.healingAmount} HP`,
            x: textX,
            y: textY,
            color: '#75e6a4',
            onComplete: () => {
              this.removeTransientEffect(textRef);
            },
          });
          textRef.destroy = () => textHandle.destroy();
          this.addTransientEffect(textRef);

          this.scene.tweens.add({
            targets: target.container,
            alpha: 0.55,
            duration: 90,
            yoyo: true,
            ease: 'Quad.easeInOut',
          });
        }

        this.callbacks?.updateHpBars();
        next();
        break;
      }

      case 'combatant_defeated': {
        const target = this.gridView.getHandle(event.participantId);
        const duration = getMotionDuration('defeat');

        if (!target || duration <= 0) {
          next();
        } else {
          const smoke = this.scene.add.graphics();
          smoke
            .setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1)
            .setPosition(Math.round(target.container.x), Math.round(target.container.y))
            .setAlpha(0)
            .fillStyle(0x9aa3ad, 1)
            .fillRect(-12, -8, 8, 8)
            .fillRect(-4, -14, 10, 10)
            .fillRect(6, -6, 8, 8);
          const smokeRef = { destroy: () => smoke.destroy() };
          this.addTransientEffect(smokeRef);
          this.scene.tweens.add({
            targets: smoke,
            alpha: { from: 1, to: 0 },
            y: Math.round(target.container.y - 8),
            duration,
            onComplete: () => {
              this.removeTransientEffect(smokeRef);
              smoke.destroy();
            },
          });

          target.applyDefeatedPresentation(duration, () => {
            next();
          });
        }
        break;
      }

      case 'turn_changed': {
        this.callbacks?.updateTurnIndicator();
        next();
        break;
      }

      case 'combat_outcome': {
        this.callbacks?.showOutcomeBanner(event.status);
        next();
        break;
      }

      default:
        next();
    }
  }
}
