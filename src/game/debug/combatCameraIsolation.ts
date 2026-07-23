import Phaser from 'phaser';

type CameraFilteredObject = Phaser.GameObjects.GameObject & { cameraFilter: number };

export function setCameraFilter(
  object: CameraFilteredObject,
  cameraId: number,
  ignored: boolean,
): void {
  if (ignored) {
    object.cameraFilter |= cameraId;
  } else {
    object.cameraFilter &= ~cameraId;
  }
}

/**
 * Splits combat rendering into a zoomable world camera and a fixed UI camera.
 * Objects are treated as world-space unless explicitly registered as UI, so
 * transient combat effects created after activation inherit the safe default.
 */
export class CombatCameraIsolation {
  private readonly cameraManager: Phaser.Cameras.Scene2D.CameraManager;
  private readonly mainCamera: Phaser.Cameras.Scene2D.Camera;
  private readonly uiCamera: Phaser.Cameras.Scene2D.Camera;
  private readonly uiObjects = new Set<CameraFilteredObject>();
  private active = true;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.cameraManager = scene.cameras;
    this.mainCamera = scene.cameras.main;
    this.uiCamera = scene.cameras.add(0, 0, width, height, false, 'combat-ui');
    this.uiCamera.setScroll(0, 0).setZoom(1);
  }

  registerUi(...objects: Array<Phaser.GameObjects.GameObject | undefined>): void {
    objects.forEach((object) => {
      if (!object) return;
      const filtered = object as CameraFilteredObject;
      this.uiObjects.add(filtered);
      setCameraFilter(filtered, this.uiCamera.id, false);
      setCameraFilter(filtered, this.mainCamera.id, true);
    });
  }

  sync(displayList: readonly Phaser.GameObjects.GameObject[]): void {
    if (!this.active) return;
    displayList.forEach((object) => {
      const filtered = object as CameraFilteredObject;
      const isUi = this.uiObjects.has(filtered);
      setCameraFilter(filtered, this.mainCamera.id, isUi);
      setCameraFilter(filtered, this.uiCamera.id, !isUi);
    });
  }

  resize(width: number, height: number): void {
    this.uiCamera.setSize(width, height);
    this.uiCamera.setScroll(0, 0).setZoom(1);
  }

  destroy(displayList: readonly Phaser.GameObjects.GameObject[]): void {
    if (!this.active) return;
    this.active = false;
    displayList.forEach((object) => {
      setCameraFilter(object as CameraFilteredObject, this.mainCamera.id, false);
      setCameraFilter(object as CameraFilteredObject, this.uiCamera.id, false);
    });
    this.uiObjects.clear();
    this.cameraManager.remove(this.uiCamera, true);
  }
}
