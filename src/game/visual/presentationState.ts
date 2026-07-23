export type PresentationMode = 'normal' | 'debug';

export const DEFAULT_PRESENTATION_MODE: PresentationMode = 'normal';

let currentMode: PresentationMode = DEFAULT_PRESENTATION_MODE;

export function getPresentationMode(): PresentationMode {
  return currentMode;
}

export function setPresentationMode(mode: PresentationMode): void {
  currentMode = mode;
}

export function togglePresentationMode(mode: PresentationMode): PresentationMode {
  return mode === 'normal' ? 'debug' : 'normal';
}

export type VisualElement =
  | 'raw_entity_state'
  | 'world_state_dump'
  | 'cell_coordinates'
  | 'raw_movement_path_status'
  | 'diagnostic_only_labels'
  | 'exploration_debug_legend'
  | 'placeholder_debug_captions'
  | 'grid_coordinate_diagnostics'
  | 'current_objective'
  | 'interaction_feedback'
  | 'hp_bars'
  | 'active_turn_feedback'
  | 'action_menu_prompts'
  | 'combat_history';

export function isElementVisible(element: VisualElement, mode: PresentationMode): boolean {
  switch (element) {
    // Technical information that should normally be hidden in normal mode:
    case 'raw_entity_state':
    case 'world_state_dump':
    case 'cell_coordinates':
    case 'raw_movement_path_status':
    case 'diagnostic_only_labels':
    case 'exploration_debug_legend':
    case 'placeholder_debug_captions':
    case 'grid_coordinate_diagnostics':
      return mode === 'debug';

    // Essential player-facing feedback that must remain visible in normal mode:
    case 'current_objective':
    case 'interaction_feedback':
    case 'hp_bars':
    case 'active_turn_feedback':
    case 'action_menu_prompts':
    case 'combat_history':
      return true;

    default:
      return false;
  }
}
