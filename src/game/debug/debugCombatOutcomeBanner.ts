import Phaser from 'phaser';

export type OutcomeBannerView = {
  container: Phaser.GameObjects.Container;
  destroy(): void;
};

export function showOutcomeBanner(
  scene: Phaser.Scene,
  outcome: 'victory' | 'defeat',
  width: number,
  height: number,
): OutcomeBannerView {
  const container = scene.add.container(width / 2, height / 2);
  container.setScrollFactor(0);
  container.setDepth(1000);

  const garbage: Phaser.GameObjects.GameObject[] = [];

  const backdrop = scene.add.graphics();
  backdrop.fillStyle(0x0a0c10, 0.75);
  backdrop.fillRect(-width / 2, -height / 2, width, height);
  container.add(backdrop);
  garbage.push(backdrop);

  const hasTextures = scene.textures.exists('visual.ui.panel.standard') && scene.textures.exists('visual.ui.border.standard');

  if (hasTextures) {
    const bgNineSlice = scene.add.nineslice(
      0, 0,
      'visual.ui.panel.standard',
      undefined,
      400, 100,
      16, 16, 16, 16
    ).setOrigin(0.5, 0.5);
    container.add(bgNineSlice);
    garbage.push(bgNineSlice);

    const borderNineSlice = scene.add.nineslice(
      0, 0,
      'visual.ui.border.standard',
      undefined,
      400, 100,
      16, 16, 16, 16
    ).setOrigin(0.5, 0.5);
    borderNineSlice.setTint(outcome === 'victory' ? 0xfacc15 : 0xef4444);
    container.add(borderNineSlice);
    garbage.push(borderNineSlice);
  } else {
    const bannerBg = scene.add.graphics();
    bannerBg.fillStyle(0x10141b, 0.95);
    bannerBg.fillRect(-200, -50, 400, 100);
    bannerBg.lineStyle(2, outcome === 'victory' ? 0xfacc15 : 0xef4444, 1);
    bannerBg.strokeRect(-200, -50, 400, 100);
    container.add(bannerBg);
    garbage.push(bannerBg);
  }

  const mainText = scene.add.text(0, -24, outcome.toUpperCase(), {
    color: outcome === 'victory' ? '#fbbf24' : '#ef4444',
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  container.add(mainText);
  garbage.push(mainText);

  const subtitle = scene.add.text(
    0,
    18,
    outcome === 'victory' ? 'Press [3] to return to exploration' : 'Press [R] to restart combat',
    {
      color: '#c8d3df',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
    }
  ).setOrigin(0.5);
  container.add(subtitle);
  garbage.push(subtitle);

  container.setScale(0);
  scene.tweens.add({
    targets: container,
    scaleX: 1,
    scaleY: 1,
    duration: 500,
    ease: 'Back.easeOut',
  });

  return {
    container,
    destroy() {
      garbage.forEach((obj) => obj.destroy());
      container.destroy();
    }
  };
}
