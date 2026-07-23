import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_WORLD_CAMERA_TRANSFORM,
  getCameraControlPolicy,
  resetWorldCamera,
} from './DebugCameraController';

vi.mock('phaser', () => ({
  default: {},
}));

describe('world camera mode-transition policy', () => {
  it('resets scroll and zoom to a deterministic screen-space-safe transform', () => {
    const setScroll = vi.fn();
    const setZoom = vi.fn();

    resetWorldCamera({ setScroll, setZoom } as never);

    expect(setScroll).toHaveBeenCalledWith(0, 0);
    expect(setZoom).toHaveBeenCalledWith(1);
    expect(DEFAULT_WORLD_CAMERA_TRANSFORM).toEqual({ scrollX: 0, scrollY: 0, zoom: 1 });
  });
});

describe('camera controls by mode', () => {
  it('keeps Q/E zoom enabled in combat while disabling combat pan', () => {
    expect(getCameraControlPolicy('combat')).toEqual({ allowPan: false, allowZoom: true });
  });

  it('keeps exploration pan and zoom enabled', () => {
    expect(getCameraControlPolicy('exploration')).toEqual({ allowPan: true, allowZoom: true });
  });
});
