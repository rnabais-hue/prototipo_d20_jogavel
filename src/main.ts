import Phaser from 'phaser';
import { PrototypeScene } from './game/scenes/PrototypeScene';
import './style.css';

export const GAME_RENDER_SETTINGS = Object.freeze({
  // Approved world art is painterly raster, not pixel art. Smooth fractional FIT
  // scaling while rounding placements to prevent sub-pixel shimmer.
  pixelArt: false,
  antialias: true,
  antialiasGL: true,
  roundPixels: true,
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 450,
  backgroundColor: '#15181f',
  ...GAME_RENDER_SETTINGS,
  scene: [PrototypeScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);


