import { describe, expect, it } from 'vitest';
import { setCameraFilter } from './combatCameraIsolation';

describe('combat camera filter isolation', () => {
  it('adds and removes only the requested camera bit', () => {
    const object = { cameraFilter: 0b0100 };

    setCameraFilter(object as never, 0b0001, true);
    expect(object.cameraFilter).toBe(0b0101);

    setCameraFilter(object as never, 0b0001, false);
    expect(object.cameraFilter).toBe(0b0100);
  });
});
