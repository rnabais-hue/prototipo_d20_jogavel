import Phaser from 'phaser';
import type { DebugCombatAttackAvailability } from '../debug/debugCombatAttackAvailability';
import { getRangeBandConfig } from './combatRangePresentation';
import { mapAvailabilityPresentation, getAvailabilityLabel } from './combatantPresentation';

export interface CombatMenuView {
  container: Phaser.GameObjects.Container;
  update: (
    availability: readonly DebugCombatAttackAvailability[],
    promptsX: number,
    promptsY: number,
  ) => void;
  setVisible: (visible: boolean) => void;
  destroy: () => void;
}

export function createCombatMenuView(scene: Phaser.Scene): CombatMenuView {
  const container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);
  const textObjects: Phaser.GameObjects.Text[] = [];

  const update = (
    availability: readonly DebugCombatAttackAvailability[],
    promptsX: number,
    promptsY: number,
  ): void => {
    // Clean up previous text objects
    textObjects.forEach((t) => t.destroy());
    textObjects.length = 0;
    container.removeAll(true);

    let currentY = promptsY;

    availability.forEach((item, index) => {
      const rangeConfig = getRangeBandConfig(item.rangeBand);
      const availPres = mapAvailabilityPresentation(item.available);
      const availLabel = getAvailabilityLabel(availPres);
      
      const statusText = item.available
        ? availLabel
        : `${availLabel}${item.distance === undefined ? '' : ` d${item.distance}`}`;

      const lineText = `[${index + 1}] ${item.actionLabel} · ${rangeConfig.label} ${item.maximumDistance} · ${statusText}`;

      // Map range configs
      let fontStyle = 'normal';
      if (rangeConfig.weight === 'heavy') {
        fontStyle = 'bold';
      } else if (rangeConfig.weight === 'light') {
        fontStyle = 'italic';
      }

      // Convert number color to hex string (e.g. #f2c14e)
      const colorStr = `#${rangeConfig.readyColor.toString(16).padStart(6, '0')}`;

      const textObj = scene.add.text(promptsX, currentY, lineText, {
        color: colorStr,
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle,
      }).setScrollFactor(0);

      textObjects.push(textObj);
      container.add(textObj);

      currentY += 14; // spacing
    });

    // Add back option at the bottom
    const backText = scene.add.text(promptsX, currentY, '[0] Back', {
      color: '#f4f0e8',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'normal',
    }).setScrollFactor(0);

    textObjects.push(backText);
    container.add(backText);
  };

  const setVisible = (visible: boolean): void => {
    container.setVisible(visible);
  };

  const destroy = (): void => {
    container.destroy(true);
  };

  return { container, update, setVisible, destroy };
}
