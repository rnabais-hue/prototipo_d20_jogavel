import Phaser from 'phaser';
import type { PresentationEvent } from './presentationEvents';
import type { DebugCombatGridView } from '../debug/debugCombatGridView';
import type { CombatSession } from '../../combat/combatSession';
import { getMotionDuration } from './motionConfig';
import { spawnFloatingText } from '../debug/debugCombatFloatingText';
import { flashOverlay } from '../debug/debugCombatFlash';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
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
        const duration = getMotionDuration('combatMove');
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
        const pendingDefeat = this.queue[1];
        const startsLethalSequence =
          pendingHit?.type === 'attack_hit' &&
          pendingHit.targetId === event.targetId &&
          pendingHit.isDefeated &&
          pendingDefeat?.type === 'combatant_defeated' &&
          pendingDefeat.participantId === event.targetId;

        if (startsLethalSequence) {
          target?.prepareForDefeatAnimation();
        }

        if (!attacker || !target || duration <= 0) {
          next();
        } else {
          const targetWorld = { x: target.container.x, y: target.container.y };
          
          // Spawn transient attack effect
          const startX = attacker.container.x;
          const startY = attacker.container.y;
          const spawnX = (startX + targetWorld.x) / 2;
          const spawnY = (startY + targetWorld.y) / 2;
          const angle = Math.atan2(targetWorld.y - startY, targetWorld.x - startX);
          
          const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.attackEffect);
          const resolution = resolveVisualAsset(entry, (key) => this.scene.textures ? this.scene.textures.exists(key) : false);
          
          if (resolution.mode === 'texture') {
            const effectSprite = this.scene.add.sprite(spawnX, spawnY, entry.key);
            effectSprite.setOrigin(entry.anchor.x, entry.anchor.y);
            effectSprite.setDisplaySize(entry.logicalWidth, entry.logicalHeight);
            effectSprite.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectSprite.setRotation(angle);
            effectSprite.setAlpha(0);
            
            const spriteRef = { destroy: () => { effectSprite.destroy(); } };
            this.addTransientEffect(spriteRef);
            
            this.scene.tweens.add({
              targets: effectSprite,
              alpha: { from: 0, to: 0.8 },
              duration: 50,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectSprite,
                  alpha: 0,
                  duration: 100,
                  onComplete: () => {
                    this.removeTransientEffect(spriteRef);
                    effectSprite.destroy();
                  }
                });
              }
            });
          } else {
            const effectGraphics = this.scene.add.graphics();
            effectGraphics.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectGraphics.setPosition(spawnX, spawnY);
            effectGraphics.setRotation(angle);
            effectGraphics.setAlpha(0);
            
            effectGraphics.lineStyle(3, 0xffffff, 0.8);
            effectGraphics.beginPath();
            effectGraphics.arc(0, 0, 20, -Math.PI / 4, Math.PI / 4);
            effectGraphics.strokePath();
            
            const graphicsRef = { destroy: () => { effectGraphics.destroy(); } };
            this.addTransientEffect(graphicsRef);
            
            this.scene.tweens.add({
              targets: effectGraphics,
              alpha: { from: 0, to: 1.0 },
              duration: 50,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectGraphics,
                  alpha: 0,
                  duration: 100,
                  onComplete: () => {
                    this.removeTransientEffect(graphicsRef);
                    effectGraphics.destroy();
                  }
                });
              }
            });
          }

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
          const textX = target.container.x;
          const textY = target.container.y - 20;
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
          
          // Spawn transient damage effect
          const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.damageEffect);
          const resolution = resolveVisualAsset(entry, (key) => this.scene.textures ? this.scene.textures.exists(key) : false);
          
          if (resolution.mode === 'texture') {
            const effectSprite = this.scene.add.sprite(textX, target.container.y, entry.key);
            effectSprite.setOrigin(entry.anchor.x, entry.anchor.y);
            effectSprite.setDisplaySize(entry.logicalWidth, entry.logicalHeight);
            effectSprite.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectSprite.setAlpha(0);
            
            const spriteRef = { destroy: () => { effectSprite.destroy(); } };
            this.addTransientEffect(spriteRef);
            
            this.scene.tweens.add({
              targets: effectSprite,
              alpha: { from: 0, to: 0.9 },
              duration: 75,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectSprite,
                  alpha: 0,
                  duration: 125,
                  onComplete: () => {
                    this.removeTransientEffect(spriteRef);
                    effectSprite.destroy();
                  }
                });
              }
            });
          } else {
            const effectGraphics = this.scene.add.graphics();
            effectGraphics.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectGraphics.setPosition(textX, target.container.y);
            effectGraphics.setAlpha(0);
            
            effectGraphics.fillStyle(0xff6b4a, 0.9);
            for (let i = 0; i < 5; i++) {
              const ang = (i * 2 * Math.PI) / 5;
              const dist = 15;
              effectGraphics.fillCircle(Math.cos(ang) * dist, Math.sin(ang) * dist, 3);
            }
            
            const graphicsRef = { destroy: () => { effectGraphics.destroy(); } };
            this.addTransientEffect(graphicsRef);
            
            this.scene.tweens.add({
              targets: effectGraphics,
              alpha: { from: 0, to: 1.0 },
              duration: 75,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectGraphics,
                  alpha: 0,
                  duration: 125,
                  onComplete: () => {
                    this.removeTransientEffect(graphicsRef);
                    effectGraphics.destroy();
                  }
                });
              }
            });
          }
        }

        // Trigger half-screen flash as secondary indicator
        const isPlayerAttacking = attacker?.isPlayer ?? false;
        const flashColor = isPlayerAttacking ? 0xa3e635 : 0xef4444;
        const flashAlpha = isPlayerAttacking ? 0.15 : 0.2;
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const flashX = isPlayerAttacking ? width * 0.5 : 0;
        const flashRef = { destroy: () => {} };
        const flashHandle = flashOverlay(this.scene, {
          color: flashColor,
          alpha: flashAlpha,
          duration: 200,
          x: flashX,
          y: 0,
          width: width * 0.5,
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
          const targetWorld = { x: target.container.x, y: target.container.y };
          attacker.playLunge(targetWorld, duration);

          const attackerWorld = { x: attacker.container.x, y: attacker.container.y };
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
          const textX = target.container.x;
          const textY = target.container.y - 20;
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
          const targetWorld = { x: target.container.x, y: target.container.y };
          attacker.playLunge(targetWorld, duration);

          const attackerWorld = { x: attacker.container.x, y: attacker.container.y };
          target.playMissReaction(attackerWorld, duration, () => {
            next();
          });
        }
        break;
      }

      case 'healing_applied': {
        const target = this.gridView.getHandle(event.participantId);

        if (target) {
          const textX = target.container.x;
          const textY = target.container.y - 20;
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

          // Small scale pulse on heal
          this.scene.tweens.add({
            targets: target.container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 100,
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
          // Spawn transient defeat effect
          const spawnX = target.container.x;
          const spawnY = target.container.y;
          
          const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.defeatEffect);
          const resolution = resolveVisualAsset(entry, (key) => this.scene.textures ? this.scene.textures.exists(key) : false);
          
          if (resolution.mode === 'texture') {
            const effectSprite = this.scene.add.sprite(spawnX, spawnY, entry.key);
            effectSprite.setOrigin(entry.anchor.x, entry.anchor.y);
            effectSprite.setDisplaySize(entry.logicalWidth, entry.logicalHeight);
            effectSprite.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectSprite.setAlpha(0);
            
            const spriteRef = { destroy: () => { effectSprite.destroy(); } };
            this.addTransientEffect(spriteRef);
            
            this.scene.tweens.add({
              targets: effectSprite,
              alpha: { from: 0, to: 0.9 },
              duration: 150,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectSprite,
                  alpha: 0,
                  duration: 350,
                  onComplete: () => {
                    this.removeTransientEffect(spriteRef);
                    effectSprite.destroy();
                  }
                });
              }
            });
          } else {
            const effectGraphics = this.scene.add.graphics();
            effectGraphics.setDepth(COMBAT_LAYER_DEPTHS.combatantTokens + 1);
            effectGraphics.setPosition(spawnX, spawnY);
            effectGraphics.setAlpha(0);
            
            effectGraphics.fillStyle(0x7b8491, 0.6);
            effectGraphics.fillCircle(0, 0, 18);
            effectGraphics.fillCircle(-8, -4, 12);
            effectGraphics.fillCircle(8, 4, 12);
            
            const graphicsRef = { destroy: () => { effectGraphics.destroy(); } };
            this.addTransientEffect(graphicsRef);
            
            this.scene.tweens.add({
              targets: effectGraphics,
              alpha: { from: 0, to: 1.0 },
              duration: 150,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: effectGraphics,
                  alpha: 0,
                  duration: 350,
                  onComplete: () => {
                    this.removeTransientEffect(graphicsRef);
                    effectGraphics.destroy();
                  }
                });
              }
            });
          }

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
