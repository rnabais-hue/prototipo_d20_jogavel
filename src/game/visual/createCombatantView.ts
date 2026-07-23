import Phaser from 'phaser';
import {
  mapCombatantVisualRole,
  mapCombatantVisualState,
  getCombatTeamPalette,
  type CombatantVisualRole,
  type CombatantVisualState,
} from './combatantPresentation';
import {
  COMBAT_VISUAL_COLORS,
  COMBAT_TOKEN_CONFIG,
} from './combatVisualConfig';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
import { playActorAnimation } from './actorAnimations';

const ACTOR_SPRITE_NAME = 'actor-spritesheet';

export function getCombatantActorSprite(
  container: Phaser.GameObjects.Container,
): Phaser.GameObjects.Sprite | undefined {
  const getByName = (container as Phaser.GameObjects.Container & {
    getByName?: (name: string) => Phaser.GameObjects.GameObject | null;
  }).getByName;
  return getByName?.call(container, ACTOR_SPRITE_NAME) as Phaser.GameObjects.Sprite | undefined;
}

export type CombatantViewOptions = {
  isPlayer: boolean;
  active: boolean;
  defeated: boolean;
  world: { x: number; y: number };
  cellSize: number;
  isTarget: boolean;
};

export function getCombatantDisplaySize(
  textureWidth: number,
  textureHeight: number,
  maximumDiameter: number,
): Readonly<{ width: number; height: number }> {
  if (
    !Number.isFinite(textureWidth) || textureWidth <= 0 ||
    !Number.isFinite(textureHeight) || textureHeight <= 0 ||
    !Number.isFinite(maximumDiameter) || maximumDiameter <= 0
  ) {
    throw new RangeError('Texture dimensions and maximum diameter must be positive finite numbers');
  }

  const scale = maximumDiameter / Math.max(textureWidth, textureHeight);
  return Object.freeze({
    width: textureWidth * scale,
    height: textureHeight * scale,
  });
}

// Draw a single combatant token graphic into a provided container.
export function drawCombatantToken(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  options: CombatantViewOptions,
): void {
  // Remove all existing children cleanly
  container.removeAll(true);

  const { isPlayer, active, defeated, world, cellSize, isTarget } = options;
  const role: CombatantVisualRole = mapCombatantVisualRole(isPlayer);
  const state: CombatantVisualState = mapCombatantVisualState(active, defeated);
  const palette = getCombatTeamPalette(role);
  const radius = cellSize * COMBAT_TOKEN_CONFIG.radiusRatio;
  const emblemRadius = cellSize * COMBAT_TOKEN_CONFIG.emblemRatio;

  // Active turn gold ring (drawn first so it appears behind the token)
  if (state === 'active') {
    const activeRing = scene.add.graphics();
    activeRing
      .lineStyle(
        COMBAT_TOKEN_CONFIG.activeRingThickness,
        COMBAT_VISUAL_COLORS.activeGold,
        1,
      )
      .strokeCircle(world.x, world.y, radius + COMBAT_TOKEN_CONFIG.activeRingOffset);
    container.add(activeRing);
  }

  // Target reticle (hostile crosshair around the enemy token)
  if (isTarget) {
    const reticle = scene.add.graphics();
    const reticleRadius = cellSize * COMBAT_TOKEN_CONFIG.reticleOuterRatio;
    const armLen = cellSize * COMBAT_TOKEN_CONFIG.reticleArmRatio;
    reticle.lineStyle(
      COMBAT_TOKEN_CONFIG.reticleThickness,
      COMBAT_VISUAL_COLORS.targetCoral,
      0.9,
    );
    // Four cardinal arms of the reticle
    reticle.lineBetween(world.x, world.y - reticleRadius, world.x, world.y - reticleRadius + armLen);
    reticle.lineBetween(world.x, world.y + reticleRadius, world.x, world.y + reticleRadius - armLen);
    reticle.lineBetween(world.x - reticleRadius, world.y, world.x - reticleRadius + armLen, world.y);
    reticle.lineBetween(world.x + reticleRadius, world.y, world.x + reticleRadius - armLen, world.y);
    // Corner diamond accent dots
    reticle
      .fillStyle(COMBAT_VISUAL_COLORS.targetGold, 0.85)
      .fillCircle(world.x, world.y - reticleRadius, 2)
      .fillCircle(world.x, world.y + reticleRadius, 2)
      .fillCircle(world.x - reticleRadius, world.y, 2)
      .fillCircle(world.x + reticleRadius, world.y, 2);
    container.add(reticle);
  }

  // Dynamic asset catalog resolution
  const assetKey = isPlayer ? VISUAL_ASSET_KEYS.playerActor : VISUAL_ASSET_KEYS.enemyActor;
  const entry = getVisualAssetEntry(assetKey);
  const resolution = resolveVisualAsset(entry, (key) => scene.textures.exists(key));

  if (resolution.mode === 'texture') {
    const sprite = scene.add.sprite(world.x, world.y, entry.key);
    sprite.setName(ACTOR_SPRITE_NAME);
    sprite.setOrigin(entry.anchor.x, entry.anchor.y);
    const displaySize = getCombatantDisplaySize(sprite.width, sprite.height, radius * 2);
    sprite.setDisplaySize(displaySize.width, displaySize.height);
    playActorAnimation(scene, sprite, role, 'idle');

    if (defeated) {
      sprite.setTint(COMBAT_VISUAL_COLORS.defeatedOverlay);
      // Gray X overlay
      const token = scene.add.graphics();
      const xLen = radius * 0.55;
      token.lineStyle(2, 0x7b8491, 0.9);
      token.lineBetween(world.x - xLen, world.y - xLen, world.x + xLen, world.y + xLen);
      token.lineBetween(world.x + xLen, world.y - xLen, world.x - xLen, world.y + xLen);
      container.add(token);
    }
    container.add(sprite);
  } else {
    // Token body
    const token = scene.add.graphics();

    if (state === 'defeated') {
      // Desaturated token
      token.fillStyle(COMBAT_VISUAL_COLORS.defeatedOverlay, 0.7).fillCircle(world.x, world.y, radius);
      token
        .lineStyle(1.5, 0x8a9aaa, 0.7)
        .strokeCircle(world.x, world.y, radius);
      // Gray X overlay
      const xLen = radius * 0.55;
      token.lineStyle(2, 0x7b8491, 0.9);
      token.lineBetween(world.x - xLen, world.y - xLen, world.x + xLen, world.y + xLen);
      token.lineBetween(world.x + xLen, world.y - xLen, world.x - xLen, world.y + xLen);
    } else {
      // Drop shadow
      token
        .fillStyle(palette.shadow, COMBAT_TOKEN_CONFIG.shadowAlpha)
        .fillCircle(world.x + 2, world.y + 2, radius);

      // Main fill
      token.fillStyle(palette.fill, 1).fillCircle(world.x, world.y, radius);

      // Inner emblem background (slightly darker)
      token
        .fillStyle(palette.shadow, 0.35)
        .fillCircle(world.x, world.y, emblemRadius * 1.3);

      // Outer rim highlight
      token.lineStyle(2, palette.rim, 0.85).strokeCircle(world.x, world.y, radius);
    }

    container.add(token);

    // Emblem glyph (sword for player, claw for enemy)
    if (state !== 'defeated') {
      const emblem = scene.add.graphics();
      emblem.lineStyle(1.5, palette.emblem, 0.92);

      if (role === 'player') {
        // Simple sword: vertical line + crossguard
        const h = emblemRadius * 1.1;
        const g = emblemRadius * 0.45;
        emblem.lineBetween(world.x, world.y - h, world.x, world.y + h * 0.7);
        emblem.lineBetween(world.x - g, world.y - h * 0.1, world.x + g, world.y - h * 0.1);
        // Shield outline (small arc at bottom)
        emblem.lineStyle(1, palette.emblem, 0.65);
        emblem.strokeCircle(world.x, world.y + emblemRadius * 0.6, emblemRadius * 0.4);
      } else {
        // Three claw marks: three angled lines fanning downward
        const clawLen = emblemRadius * 1.1;
        emblem.lineBetween(world.x - emblemRadius * 0.4, world.y - clawLen * 0.3, world.x - emblemRadius * 0.6, world.y + clawLen * 0.7);
        emblem.lineBetween(world.x, world.y - clawLen * 0.5, world.x, world.y + clawLen * 0.8);
        emblem.lineBetween(world.x + emblemRadius * 0.4, world.y - clawLen * 0.3, world.x + emblemRadius * 0.6, world.y + clawLen * 0.7);
      }

      container.add(emblem);
    }
  }
}

export type CombatantTokenHandle = {
  // Redraw the token with updated options.
  redraw: (options: CombatantViewOptions) => void;
  // Remove from scene.
  destroy: () => void;
};

export function createCombatantTokenHandle(
  scene: Phaser.Scene,
  initialOptions: CombatantViewOptions,
): CombatantTokenHandle {
  const container = scene.add
    .container(0, 0)
    .setDepth(COMBAT_LAYER_DEPTHS.combatantTokens)
    .setScrollFactor(0);

  drawCombatantToken(scene, container, initialOptions);

  return {
    redraw(options) {
      drawCombatantToken(scene, container, options);
    },
    destroy() {
      container.destroy(true);
    },
  };
}
