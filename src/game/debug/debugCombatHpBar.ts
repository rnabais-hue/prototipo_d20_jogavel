import Phaser from 'phaser';

export type CombatHpBarConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  current: number;
  maximum: number;
  label: string;
  isPlayer: boolean;
};

export type CombatHpBarView = {
  container: Phaser.GameObjects.Container;
  update(current: number, maximum: number): void;
  destroy(): void;
};

export function createCombatHpBar(scene: Phaser.Scene, config: CombatHpBarConfig): CombatHpBarView {
  const container = scene.add.container(config.x, config.y);
  container.setScrollFactor(0);

  // 1. Create a label text positioned just above the bar (e.g. at y: -16)
  // - Text format: `${config.label}: ${config.current}/${config.maximum} HP`
  // - Style: fontSize: '11px', fontFamily: 'Arial, sans-serif', bold,
  // - Color: `#9fd8b5` (player-like green) if config.isPlayer, else `#ffb7b2` (opponent-like red)
  const labelText = scene.add.text(0, -16, `${config.label}: ${config.current}/${config.maximum} HP`, {
    color: config.isPlayer ? '#9fd8b5' : '#ffb7b2',
    fontSize: '11px',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
  });
  container.add(labelText);

  // 2. Create Background Graphics for the bar
  const bg = scene.add.graphics();
  bg.fillStyle(0x10141b, 1);
  bg.fillRect(0, 0, config.width, config.height);
  bg.lineStyle(1, 0x3c4c63, 1);
  bg.strokeRect(0, 0, config.width, config.height);
  container.add(bg);

  // 3. Create Fill Graphics for the HP bar
  const fill = scene.add.graphics();
  container.add(fill);

  const animState = { ratio: Math.max(0, Math.min(1, config.current / config.maximum)) };

  const drawFill = () => {
    fill.clear();
    const w = config.width * animState.ratio;
    if (w > 0) {
      // Color thresholds: > 60% green (0x4ade80), 30–60% yellow (0xfacc15), < 30% red (0xef4444)
      let color = 0xef4444;
      if (animState.ratio > 0.6) {
        color = 0x4ade80;
      } else if (animState.ratio > 0.3) {
        color = 0xfacc15;
      }
      fill.fillStyle(color, 1);
      fill.fillRect(0, 0, w, config.height);
    }
  };

  drawFill();

  let activeTween: Phaser.Tweens.Tween | undefined;

  return {
    container,
    update(current: number, maximum: number) {
      labelText.setText(`${config.label}: ${current}/${maximum} HP`);
      const targetRatio = Math.max(0, Math.min(1, current / maximum));

      if (activeTween) {
        activeTween.stop();
      }

      activeTween = scene.tweens.add({
        targets: animState,
        ratio: targetRatio,
        duration: 200,
        ease: 'Cubic.easeOut',
        onUpdate: drawFill,
        onComplete: () => {
          activeTween = undefined;
        }
      });
    },
    destroy() {
      labelText.destroy();
      bg.destroy();
      fill.destroy();
      container.destroy();
      if (activeTween) {
        activeTween.stop();
      }
    }
  };
}
