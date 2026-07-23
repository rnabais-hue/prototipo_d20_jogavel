import Phaser from 'phaser';

export type FlashConfig = {
  color: number;       // hex color (e.g. 0xff4444)
  alpha?: number;      // default 0.3
  duration?: number;   // default 200ms
  x: number;
  y: number;
  width: number;
  height: number;
  onComplete?: () => void; // Added callback
};

export function flashOverlay(scene: Phaser.Scene, config: FlashConfig): { destroy: () => void } {
  const alpha = config.alpha ?? 0.3;
  const duration = config.duration ?? 200;

  const flash = scene.add.graphics();
  flash.fillStyle(config.color, alpha);
  flash.fillRect(config.x, config.y, config.width, config.height);
  flash.setScrollFactor(0);
  flash.setDepth(999);

  const tween = scene.tweens.add({
    targets: flash,
    alpha: 0,
    ease: 'Cubic.easeOut', // or 'Cubic.Out'
    duration: duration,
    onComplete: () => {
      flash.destroy();
      config.onComplete?.();
    }
  });

  return {
    destroy() {
      if (tween) {
        tween.stop();
      }
      if (flash && flash.active) {
        flash.destroy();
      }
    }
  };
}
