import Phaser from 'phaser';

type DebugCameraControllerOptions = {
  panSpeed?: number;
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type DebugCameraUpdateOptions = {
  allowPan?: boolean;
  allowZoom?: boolean;
};

export function getCameraControlPolicy(mode: 'exploration' | 'combat'): Required<DebugCameraUpdateOptions> {
  return {
    allowPan: mode === 'exploration',
    allowZoom: true,
  };
}

type DebugCameraKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  q: Phaser.Input.Keyboard.Key;
  e: Phaser.Input.Keyboard.Key;
  r: Phaser.Input.Keyboard.Key;
};

const DEFAULT_PAN_SPEED = 280;
const DEFAULT_ZOOM_SPEED = 1.4;
const DEFAULT_MIN_ZOOM = 0.6;
const DEFAULT_MAX_ZOOM = 1.8;

export const DEFAULT_WORLD_CAMERA_TRANSFORM = Object.freeze({
  scrollX: 0,
  scrollY: 0,
  zoom: 1,
});

type ResettableCamera = Pick<Phaser.Cameras.Scene2D.Camera, 'setScroll' | 'setZoom'>;

/** Keep mode transitions deterministic and prevent zoomed exploration state from scaling combat UI. */
export function resetWorldCamera(camera: ResettableCamera): void {
  camera.setScroll(DEFAULT_WORLD_CAMERA_TRANSFORM.scrollX, DEFAULT_WORLD_CAMERA_TRANSFORM.scrollY);
  camera.setZoom(DEFAULT_WORLD_CAMERA_TRANSFORM.zoom);
}

export class DebugCameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;

  private readonly keys?: DebugCameraKeys;

  private readonly panSpeed: number;

  private readonly zoomSpeed: number;

  private readonly minZoom: number;

  private readonly maxZoom: number;

  constructor(
    scene: Phaser.Scene,
    options: DebugCameraControllerOptions = {},
  ) {
    this.camera = scene.cameras.main;
    this.panSpeed = options.panSpeed ?? DEFAULT_PAN_SPEED;
    this.zoomSpeed = options.zoomSpeed ?? DEFAULT_ZOOM_SPEED;
    this.minZoom = options.minZoom ?? DEFAULT_MIN_ZOOM;
    this.maxZoom = options.maxZoom ?? DEFAULT_MAX_ZOOM;

    this.keys = scene.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    }) as DebugCameraKeys | undefined;

    this.reset();
  }

  update(deltaMs: number, options: DebugCameraUpdateOptions = {}): void {
    if (!this.keys) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.r)) {
      this.reset();
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    const panDistance = this.panSpeed * deltaSeconds;
    const zoomDelta = this.zoomSpeed * deltaSeconds;

    const allowPan = options.allowPan ?? true;
    const allowZoom = options.allowZoom ?? true;
    let scrollX = this.camera.scrollX;
    let scrollY = this.camera.scrollY;

    if (allowPan && (this.keys.left.isDown || this.keys.a.isDown)) {
      scrollX -= panDistance;
    }

    if (allowPan && (this.keys.right.isDown || this.keys.d.isDown)) {
      scrollX += panDistance;
    }

    if (allowPan && (this.keys.up.isDown || this.keys.w.isDown)) {
      scrollY -= panDistance;
    }

    if (allowPan && (this.keys.down.isDown || this.keys.s.isDown)) {
      scrollY += panDistance;
    }

    if (allowPan) {
      this.camera.setScroll(scrollX, scrollY);
    }

    if (allowZoom && this.keys.q.isDown) {
      this.setZoom(this.camera.zoom - zoomDelta);
    }

    if (allowZoom && this.keys.e.isDown) {
      this.setZoom(this.camera.zoom + zoomDelta);
    }
  }

  reset(): void {
    resetWorldCamera(this.camera);
  }

  private setZoom(zoom: number): void {
    this.camera.setZoom(Phaser.Math.Clamp(zoom, this.minZoom, this.maxZoom));
  }
}
