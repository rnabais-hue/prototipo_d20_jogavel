import Phaser from 'phaser';
import { PrototypeScene } from './game/scenes/PrototypeScene';
import './style.css';

export const GAME_RENDER_SETTINGS = Object.freeze({
  pixelArt: true,
  antialias: false,
  antialiasGL: false,
  roundPixels: true,
});

export const GAME_LOGICAL_SIZE = Object.freeze({
  width: 640,
  height: 360,
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  ...GAME_LOGICAL_SIZE,
  backgroundColor: '#15181f',
  ...GAME_RENDER_SETTINGS,
  scene: [PrototypeScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    zoom: Phaser.Scale.MAX_ZOOM,
  },
};

new Phaser.Game(config);


