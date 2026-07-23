import Phaser from 'phaser';

export type TurnIndicatorView = {
  container: Phaser.GameObjects.Container;
  update(activeName: string, isPlayerTurn: boolean): void;
  destroy(): void;
};

export function createTurnIndicator(scene: Phaser.Scene, x: number, y: number): TurnIndicatorView {
  const container = scene.add.container(x, y);
  container.setScrollFactor(0);

  const garbage: Phaser.GameObjects.GameObject[] = [];

  const hasTextures = scene.textures.exists('visual.ui.panel.standard') && scene.textures.exists('visual.ui.border.standard');

  if (hasTextures) {
    const bgNineSlice = scene.add.nineslice(
      0, 16,
      'visual.ui.panel.standard',
      undefined,
      200, 32,
      16, 16, 16, 16
    ).setOrigin(0.5, 0.5);
    container.add(bgNineSlice);
    garbage.push(bgNineSlice);

    const borderNineSlice = scene.add.nineslice(
      0, 16,
      'visual.ui.border.standard',
      undefined,
      200, 32,
      16, 16, 16, 16
    ).setOrigin(0.5, 0.5);
    container.add(borderNineSlice);
    garbage.push(borderNineSlice);
  } else {
    const bg = scene.add.graphics();
    bg.fillStyle(0x10141b, 0.9);
    bg.fillRect(-100, 0, 200, 32);
    bg.lineStyle(1, 0x3c4c63, 1);
    bg.strokeRect(-100, 0, 200, 32);
    container.add(bg);
    garbage.push(bg);
  }

  const pip = scene.add.graphics();
  container.add(pip);
  garbage.push(pip);

  let turnMarkerSprite: Phaser.GameObjects.Sprite | undefined;
  const hasPipTexture = scene.textures.exists('visual.ui.icon.turn_marker');
  if (hasPipTexture) {
    turnMarkerSprite = scene.add.sprite(-80, 16, 'visual.ui.icon.turn_marker').setScale(0.5);
    container.add(turnMarkerSprite);
    garbage.push(turnMarkerSprite);
  }

  const drawPip = (isPlayer: boolean) => {
    if (turnMarkerSprite) {
      turnMarkerSprite.setTint(isPlayer ? 0x4ade80 : 0xef4444);
    } else {
      pip.clear();
      pip.fillStyle(isPlayer ? 0x4ade80 : 0xef4444, 1);
      pip.fillCircle(-80, 16, 6);
      pip.lineStyle(1, 0xf4f0e8, 1);
      pip.strokeCircle(-80, 16, 6);
    }
  };

  const label = scene.add.text(-60, 9, 'Turn: None', {
    color: '#f4f0e8',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
  });
  container.add(label);
  garbage.push(label);

  let currentTurnOwner: string | undefined;

  return {
    container,
    update(activeName: string, isPlayerTurn: boolean) {
      if (currentTurnOwner !== activeName) {
        currentTurnOwner = activeName;
        label.setText(`Turn: ${activeName}`);
        drawPip(isPlayerTurn);

        scene.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          yoyo: true,
          ease: 'Quad.easeInOut',
        });
      }
    },
    destroy() {
      garbage.forEach((obj) => obj.destroy());
      container.destroy();
    }
  };
}
