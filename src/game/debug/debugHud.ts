import Phaser from 'phaser';

export type DebugHudSections = {
  objective: string;
  interaction: string;
  entity: string;
  world: string;
  move: string;
};

type DebugHudTextSet = Record<keyof DebugHudSections, Phaser.GameObjects.Text>;

const HUD_SCREEN_PADDING = 16;
const HUD_TOP_Y = 64;
const HUD_INTERACTION_Y = 152;
const HUD_ENTITY_BOTTOM_OFFSET = 176;
const HUD_WORLD_BOTTOM_OFFSET = 96;
const HUD_MOVE_BOTTOM_OFFSET = 128;
const HUD_TEXT_WIDTH = 280;
const HUD_LINE_SPACING = 4;

const HUD_SHARED_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: '#c8d3df',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  backgroundColor: '#10141b',
  padding: { x: 8, y: 6 },
};

const HUD_PLAYER_FACING_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: '#c8d3df',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  padding: { x: 4, y: 3 },
  stroke: '#10141b',
  strokeThickness: 3,
  shadow: {
    offsetX: 1,
    offsetY: 1,
    color: '#10141b',
    blur: 2,
    fill: true,
  },
};

const HUD_OBJECTIVE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...HUD_PLAYER_FACING_STYLE,
  color: '#f4f0e8',
};

const HUD_INTERACTION_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...HUD_PLAYER_FACING_STYLE,
  color: '#f2c14e',
};

export function createDebugHud(
  scene: Phaser.Scene,
  sections: DebugHudSections,
): DebugHudTextSet {
  const { width, height } = scene.scale;

  return {
    objective: createHudBlock(
      scene,
      width - HUD_SCREEN_PADDING,
      HUD_TOP_Y,
      sections.objective,
      HUD_OBJECTIVE_STYLE,
      1,
    ),
    interaction: createHudBlock(
      scene,
      width - HUD_SCREEN_PADDING,
      HUD_INTERACTION_Y,
      sections.interaction,
      HUD_INTERACTION_STYLE,
      1,
    ),
    entity: createHudBlock(
      scene,
      112,
      height - HUD_ENTITY_BOTTOM_OFFSET,
      sections.entity,
      HUD_SHARED_STYLE,
    ),
    world: createHudBlock(
      scene,
      112,
      height - HUD_WORLD_BOTTOM_OFFSET,
      sections.world,
      HUD_SHARED_STYLE,
    ),
    move: createHudBlock(
      scene,
      width - HUD_SCREEN_PADDING,
      height - HUD_MOVE_BOTTOM_OFFSET,
      sections.move,
      HUD_SHARED_STYLE,
      1,
    ),
  };
}

export function updateDebugHud(
  texts: DebugHudTextSet,
  sections: DebugHudSections,
): void {
  texts.objective.setText(sections.objective);
  texts.interaction.setText(sections.interaction);
  texts.entity.setText(sections.entity);
  texts.world.setText(sections.world);
  texts.move.setText(sections.move);
}

function createHudBlock(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle,
  originX = 0,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    ...style,
    fixedWidth: HUD_TEXT_WIDTH,
    lineSpacing: HUD_LINE_SPACING,
  })
    .setOrigin(originX, 0)
    .setScrollFactor(0);
}

export function repositionAndStyleHudBlock(
  textObj: Phaser.GameObjects.Text,
  x: number,
  y: number,
  width: number,
  originX: number,
  fontSize: string,
  paddingX: number,
  paddingY: number,
  lineSpacing: number,
): void {
  textObj.setPosition(x, y);
  textObj.setOrigin(originX, 0);
  textObj.setLineSpacing(lineSpacing);
  textObj.setPadding(paddingX, paddingY, paddingX, paddingY);
  textObj.setStyle({ fontSize, fixedWidth: width });
}
