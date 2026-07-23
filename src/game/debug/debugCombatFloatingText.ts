import Phaser from 'phaser';

export type FloatingTextConfig = {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize?: number;
  duration?: number;
  floatDistance?: number;
  onComplete?: () => void; // Added callback
};

export function spawnFloatingText(scene: Phaser.Scene, config: FloatingTextConfig): { destroy: () => void } {
  const fontSize = config.fontSize ?? 18;
  const duration = config.duration ?? 1200;
  const floatDistance = config.floatDistance ?? 40;

  const textObj = scene.add.text(config.x, config.y, config.text, {
    color: config.color,
    fontSize: `${fontSize}px`,
    fontStyle: 'bold',
    fontFamily: 'Arial, sans-serif',
  });
  textObj.setOrigin(0.5);
  textObj.setScrollFactor(0);

  const tween = scene.tweens.add({
    targets: textObj,
    y: config.y - floatDistance,
    alpha: 0,
    ease: 'Cubic.easeOut',
    duration: duration,
    onComplete: () => {
      textObj.destroy();
      config.onComplete?.();
    },
  });

  return {
    destroy() {
      if (tween) {
        tween.stop();
      }
      if (textObj && textObj.active) {
        textObj.destroy();
      }
    }
  };
}
