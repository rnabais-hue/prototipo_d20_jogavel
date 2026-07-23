import { describe, expect, it } from 'vitest';
import {
  getInteractionFeedback,
  getInteractionFeedbackLayout,
  INTERACTION_FEEDBACK_DURATION_MS,
} from './interactionFeedback';

describe('interaction feedback presentation', () => {
  it('keeps technical identifiers out of the player-facing exit message', () => {
    const feedback = getInteractionFeedback({
      point: { id: 'exit-1', kind: 'exit_marker', label: 'East Gate', cell: { x: 1, y: 1 } },
      effect: { type: 'exit_marker_activated' },
    } as never);

    expect(feedback.playerMessage).toBe('Saída ativada.');
    expect(feedback.playerMessage).not.toContain('exit');
    expect(feedback.debugMessage).toContain('exit marker activated: East Gate');
  });

  it('uses a short finite display duration', () => {
    expect(INTERACTION_FEEDBACK_DURATION_MS).toBeGreaterThanOrEqual(1500);
    expect(INTERACTION_FEEDBACK_DURATION_MS).toBeLessThanOrEqual(3000);
  });

  it.each([
    [800, 450, 320, 398],
    [640, 360, 320, 316],
  ])('keeps feedback centered and inside a %sx%s viewport', (width, height, fixedWidth, y) => {
    const layout = getInteractionFeedbackLayout(width, height);
    expect(layout).toEqual({
      x: width / 2,
      y,
      fixedWidth,
      wrapWidth: fixedWidth - 16,
    });
    expect(layout.x - layout.fixedWidth / 2).toBeGreaterThanOrEqual(16);
    expect(layout.x + layout.fixedWidth / 2).toBeLessThanOrEqual(width - 16);
  });
});
