import type { InterestPointInteractionResult } from '../../exploration/interestPoint';

export const INTERACTION_FEEDBACK_DURATION_MS = 2400;

export type InteractionFeedback = {
  playerMessage: string;
  debugMessage: string;
};

export function getInteractionFeedbackLayout(width: number, height: number) {
  const fixedWidth = Math.min(320, width - 32);
  return {
    x: width / 2,
    y: height - (height < 420 ? 44 : 52),
    fixedWidth,
    wrapWidth: fixedWidth - 16,
  };
}

export function getInteractionFeedback(
  result: InterestPointInteractionResult,
): InteractionFeedback {
  switch (result.effect.type) {
    case 'survey_discovered':
      return {
        playerMessage: 'Local observado.',
        debugMessage: `status: interaction resolved (survey discovered: ${result.point.label})`,
      };
    case 'switch_toggled':
      return {
        playerMessage: result.effect.active ? 'Mecanismo ativado.' : 'Mecanismo desativado.',
        debugMessage: `status: interaction resolved (switch ${result.effect.active ? 'on' : 'off'}: ${result.point.label})`,
      };
    case 'exit_marker_activated':
      return {
        playerMessage: 'Saída ativada.',
        debugMessage: `status: interaction resolved (exit marker activated: ${result.point.label})`,
      };
    case 'combat_triggered':
      return {
        playerMessage: 'Combate iniciado.',
        debugMessage: `status: interaction resolved (combat triggered: ${result.effect.encounterPresetId})`,
      };
  }
}
