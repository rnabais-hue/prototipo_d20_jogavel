import { describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {
    AUTO: 0,
    Scale: { FIT: 0, CENTER_BOTH: 0 },
    Game: vi.fn(),
  },
}));

vi.mock('./game/scenes/PrototypeScene', () => ({ PrototypeScene: class {} }));
vi.mock('./style.css', () => ({}));

describe('game renderer settings', () => {
  it('smooths painterly raster art while keeping placements pixel-aligned', async () => {
    const { GAME_RENDER_SETTINGS } = await import('./main');

    expect(GAME_RENDER_SETTINGS).toEqual({
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
      roundPixels: true,
    });
  });
});
