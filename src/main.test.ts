import { describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {
    AUTO: 0,
    Scale: { FIT: 0, CENTER_BOTH: 0, MAX_ZOOM: -1 },
    Game: vi.fn(),
  },
}));

vi.mock('./game/scenes/PrototypeScene', () => ({ PrototypeScene: class {} }));
vi.mock('./style.css', () => ({}));

describe('game renderer settings', () => {
  it('uses a fixed pixel-art canvas with interpolation disabled', async () => {
    const { GAME_LOGICAL_SIZE, GAME_RENDER_SETTINGS } = await import('./main');

    expect(GAME_RENDER_SETTINGS).toEqual({
      pixelArt: true,
      antialias: false,
      antialiasGL: false,
      roundPixels: true,
    });
    expect(GAME_LOGICAL_SIZE).toEqual({ width: 640, height: 360 });
  });
});
