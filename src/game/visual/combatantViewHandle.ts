import Phaser from 'phaser';
import type { GridCell } from '../../movement/grid';
import type { DebugCombatGridLayout } from '../debug/debugCombatGridProjection';
import { projectCombatCellToWorld } from '../debug/debugCombatGridProjection';
import { drawCombatantToken, getCombatantActorSprite } from './createCombatantView';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';
import { getMotionDuration } from './motionConfig';
import { playActorAnimation, type ActorAnimationState } from './actorAnimations';

export interface CombatantViewHandle {
  readonly participantId: string;
  readonly container: Phaser.GameObjects.Container;
  readonly isPlayer: boolean;
  
  // Store active tweens so we can cancel them safely
  activeTweens: Phaser.Tweens.Tween[];

  projectAuthoritativePosition(cell: GridCell, layout: DebugCombatGridLayout): { x: number; y: number };
  animatePresentationPosition(targetWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void;
  playAnticipation(targetWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void;
  playLunge(targetWorld: { x: number; y: number }, duration: number): void;
  playHitReaction(attackerWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void;
  playMissReaction(attackerWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void;
  prepareForDefeatAnimation(): void;
  applyDefeatedPresentation(duration: number, onComplete?: () => void): void;
  snapToAuthoritativeState(world: { x: number; y: number }, options: { active: boolean; defeated: boolean; isTarget: boolean; cellSize: number }, forceSnap?: boolean): void;
  cancelActiveTweens(): void;
  destroy(): void;
}

export class PhaserCombatantViewHandle implements CombatantViewHandle {
  readonly participantId: string;
  readonly container: Phaser.GameObjects.Container;
  readonly isPlayer: boolean;
  private scene: Phaser.Scene;
  private lastPresentationOptions?: { active: boolean; defeated: boolean; isTarget: boolean; cellSize: number };
  activeTweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene, participantId: string, isPlayer: boolean) {
    this.scene = scene;
    this.participantId = participantId;
    this.isPlayer = isPlayer;

    // Create the container at (0, 0) initially
    this.container = scene.add
      .container(0, 0)
      .setDepth(COMBAT_LAYER_DEPTHS.combatantTokens)
      .setScrollFactor(0);
  }

  projectAuthoritativePosition(cell: GridCell, layout: DebugCombatGridLayout): { x: number; y: number } {
    return projectCombatCellToWorld(cell, layout);
  }

  private addTween(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween {
    const tween = this.scene.tweens.add(config);
    this.activeTweens.push(tween);
    // Remove from active list when complete/stopped
    tween.on('complete', () => {
      this.activeTweens = this.activeTweens.filter((t) => t !== tween);
    });
    tween.on('stop', () => {
      this.activeTweens = this.activeTweens.filter((t) => t !== tween);
    });
    return tween;
  }

  private playFrameAnimation(state: ActorAnimationState): boolean {
    return playActorAnimation(
      this.scene,
      getCombatantActorSprite(this.container),
      this.isPlayer ? 'player' : 'enemy',
      state,
    );
  }

  animatePresentationPosition(targetWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void {
    this.cancelActiveTweens();

    if (duration <= 0) {
      this.container.setPosition(targetWorld.x, targetWorld.y);
      onComplete?.();
      return;
    }

    if (this.isPlayer) {
      this.playFrameAnimation('movement');
    }

    this.addTween({
      targets: this.container,
      x: targetWorld.x,
      y: targetWorld.y,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.playFrameAnimation('idle');
        onComplete?.();
      },
    });
  }

  private homeX?: number;
  private homeY?: number;

  playAnticipation(targetWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void {
    this.cancelActiveTweens();

    this.homeX = this.container.x;
    this.homeY = this.container.y;

    if (duration <= 0) {
      onComplete?.();
      return;
    }

    this.playFrameAnimation('attack');

    const startX = this.container.x;
    const startY = this.container.y;
    let dx = targetWorld.x - startX;
    let dy = targetWorld.y - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    const ux = len > 0.01 ? dx / len : 1;
    const uy = len > 0.01 ? dy / len : 0;

    const anticDist = 15;
    const anticX = startX - ux * anticDist;
    const anticY = startY - uy * anticDist;

    this.addTween({
      targets: this.container,
      x: anticX,
      y: anticY,
      scaleY: 0.85,
      scaleX: 1.1,
      duration: duration,
      ease: 'Back.easeOut',
      onComplete: () => {
        onComplete?.();
      },
    });
  }

  playLunge(targetWorld: { x: number; y: number }, duration: number): void {
    this.cancelActiveTweens();

    const hX = this.homeX !== undefined ? this.homeX : this.container.x;
    const hY = this.homeY !== undefined ? this.homeY : this.container.y;

    let dx = targetWorld.x - hX;
    let dy = targetWorld.y - hY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = len > 0.01 ? dx / len : 1;
    const uy = len > 0.01 ? dy / len : 0;

    const lungeDist = 25;
    const lungeX = hX + ux * lungeDist;
    const lungeY = hY + uy * lungeDist;

    this.addTween({
      targets: this.container,
      x: lungeX,
      y: lungeY,
      scaleY: 1.1,
      scaleX: 0.85,
      duration: duration * 0.5,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.addTween({
          targets: this.container,
          x: hX,
          y: hY,
          scaleX: 1,
          scaleY: 1,
          duration: duration * 0.5,
          ease: 'Quad.easeInOut',
          onComplete: () => {
            this.playFrameAnimation('idle');
          },
        });
      }
    });
  }

  playHitReaction(attackerWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void {
    this.cancelActiveTweens();

    if (duration <= 0) {
      onComplete?.();
      return;
    }

    this.playFrameAnimation('hit');

    const startX = this.container.x;
    const startY = this.container.y;
    let dx = startX - attackerWorld.x;
    let dy = startY - attackerWorld.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = len > 0.01 ? dx / len : 1;
    const uy = len > 0.01 ? dy / len : 0;

    const pushDist = 12;
    const pushX = startX + ux * pushDist;
    const pushY = startY + uy * pushDist;

    this.container.setScale(1.2);
    
    this.addTween({
      targets: this.container,
      x: pushX,
      y: pushY,
      alpha: 0.6,
      duration: duration / 2,
      ease: 'Cubic.easeOut',
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.container.setScale(1);
        this.container.setAlpha(1);
        this.container.setPosition(startX, startY);
        this.playFrameAnimation('idle');
        onComplete?.();
      },
    });
  }

  playMissReaction(attackerWorld: { x: number; y: number }, duration: number, onComplete?: () => void): void {
    this.cancelActiveTweens();

    if (duration <= 0) {
      onComplete?.();
      return;
    }

    this.playFrameAnimation('idle');

    const startX = this.container.x;
    const startY = this.container.y;
    let dx = startX - attackerWorld.x;
    let dy = startY - attackerWorld.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = len > 0.01 ? dx / len : 1;
    const uy = len > 0.01 ? dy / len : 0;

    const px = -uy;
    const py = ux;

    const evadeDist = 20;
    const evadeX = startX + px * evadeDist;
    const evadeY = startY + py * evadeDist;

    this.addTween({
      targets: this.container,
      x: evadeX,
      y: evadeY,
      duration: duration / 2,
      ease: 'Cubic.easeOut',
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.container.setPosition(startX, startY);
        onComplete?.();
      },
    });
  }

  prepareForDefeatAnimation(): void {
    const options = this.lastPresentationOptions;
    if (!options) return;

    this.container.setScale(1);
    this.container.setAlpha(1);
    this.container.setAngle(0);
    drawCombatantToken(this.scene, this.container, {
      isPlayer: this.isPlayer,
      active: options.active,
      defeated: false,
      world: { x: 0, y: 0 },
      cellSize: options.cellSize,
      isTarget: options.isTarget,
    });
  }

  applyDefeatedPresentation(duration: number, onComplete?: () => void): void {
    this.cancelActiveTweens();

    if (duration <= 0) {
      this.container.setScale(0);
      this.container.setAlpha(0);
      onComplete?.();
      return;
    }

    if (this.playFrameAnimation('defeat')) {
      this.addTween({
        targets: this.container,
        alpha: 1,
        duration,
        ease: 'Linear',
        onComplete: () => {
          this.container.setScale(0);
          this.container.setAlpha(0);
          onComplete?.();
        },
      });
      return;
    }

    this.addTween({
      targets: this.container,
      scaleX: 0,
      scaleY: 0,
      angle: 90,
      alpha: 0,
      duration: duration,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        onComplete?.();
      },
    });
  }

  snapToAuthoritativeState(
    world: { x: number; y: number },
    options: { active: boolean; defeated: boolean; isTarget: boolean; cellSize: number },
    forceSnap = false
  ): void {
    this.lastPresentationOptions = { ...options };

    if (forceSnap) {
      this.cancelActiveTweens();
    }

    if (forceSnap || this.activeTweens.length === 0) {
      this.container.setPosition(world.x, world.y);
      if (options.defeated) {
        this.container.setScale(0);
        this.container.setAlpha(0);
        this.container.setAngle(90);
      } else {
        this.container.setScale(1);
        this.container.setAlpha(1);
        this.container.setAngle(0);
      }
    }

    // Redraw the token content locally centered at container 0,0
    drawCombatantToken(this.scene, this.container, {
      isPlayer: this.isPlayer,
      active: options.active,
      defeated: options.defeated,
      world: { x: 0, y: 0 },
      cellSize: options.cellSize,
      isTarget: options.isTarget,
    });
  }

  cancelActiveTweens(): void {
    this.activeTweens.forEach((tween) => {
      tween.stop();
    });
    this.activeTweens = [];
  }

  destroy(): void {
    this.cancelActiveTweens();
    this.container.destroy(true);
  }
}
