import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRESENTATION_MODE,
  togglePresentationMode,
  isElementVisible,
  getPresentationMode,
  setPresentationMode,
  type PresentationMode,
} from './presentationState';

describe('presentationState helper functions', () => {
  it('has default mode normal', () => {
    expect(DEFAULT_PRESENTATION_MODE).toBe('normal');
  });

  it('toggles normal -> debug', () => {
    const result = togglePresentationMode('normal');
    expect(result).toBe('debug');
  });

  it('toggles debug -> normal', () => {
    const result = togglePresentationMode('debug');
    expect(result).toBe('normal');
  });

  it('can set and get presentation mode', () => {
    setPresentationMode('debug');
    expect(getPresentationMode()).toBe('debug');
    setPresentationMode('normal');
    expect(getPresentationMode()).toBe('normal');
  });

  it('keeps essential player-facing elements visible in both modes', () => {
    const essentialElements = [
      'current_objective',
      'interaction_feedback',
      'hp_bars',
      'active_turn_feedback',
      'action_menu_prompts',
      'combat_history',
    ] as const;

    for (const elem of essentialElements) {
      expect(isElementVisible(elem, 'normal')).toBe(true);
      expect(isElementVisible(elem, 'debug')).toBe(true);
    }
  });

  it('hides technical elements in normal mode', () => {
    const technicalElements = [
      'raw_entity_state',
      'world_state_dump',
      'cell_coordinates',
      'raw_movement_path_status',
      'diagnostic_only_labels',
      'exploration_debug_legend',
      'placeholder_debug_captions',
      'grid_coordinate_diagnostics',
    ] as const;

    for (const elem of technicalElements) {
      expect(isElementVisible(elem, 'normal')).toBe(false);
    }
  });

  it('shows technical elements in debug mode', () => {
    const technicalElements = [
      'raw_entity_state',
      'world_state_dump',
      'cell_coordinates',
      'raw_movement_path_status',
      'diagnostic_only_labels',
      'exploration_debug_legend',
      'placeholder_debug_captions',
      'grid_coordinate_diagnostics',
    ] as const;

    for (const elem of technicalElements) {
      expect(isElementVisible(elem, 'debug')).toBe(true);
    }
  });
});
