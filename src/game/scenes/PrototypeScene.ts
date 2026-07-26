import Phaser from 'phaser';
import { createExplorableEntity } from '../../exploration/explorableEntity';
import {
  findOrthogonalPath,
  type OrthogonalPathFailure,
} from '../../exploration/orthogonalPathfinding';
import type { InterestPointInteractionResult } from '../../exploration/interestPoint';
import { worldToGrid, type GridCell } from '../../movement/grid';
import { getPrototypeLabel } from '../../rules/prototypeLabel';
import {
  createDebugExplorationMap,
  DEBUG_ACTOR_MOVE_RANGE,
  DEBUG_EXPLORATION_ENTITY_START_CELL,
  DEBUG_EXPLORATION_GRID,
  DEBUG_INTEREST_POINTS,
} from '../debug/debugExplorationConfig';
import { DebugActorController } from '../debug/DebugActorController';
import {
  DebugCameraController,
  getCameraControlPolicy,
  resetWorldCamera,
} from '../debug/DebugCameraController';
import { CombatCameraIsolation } from '../debug/combatCameraIsolation';
import {
  getInteractionFeedback,
  getInteractionFeedbackLayout,
  INTERACTION_FEEDBACK_DURATION_MS,
  type InteractionFeedback,
} from '../debug/interactionFeedback';
import {
  createDebugHud,
  updateDebugHud,
  repositionAndStyleHudBlock,
  type DebugHudSections,
} from '../debug/debugHud';
import {
  drawExplorationMap,
  redrawExplorationMap,
  type ExplorationMapView,
} from '../visual/drawExplorationMap';
import { drawExplorationLegend } from '../visual/drawExplorationLegend';
import { spawnFloatingText } from '../debug/debugCombatFloatingText';
import { createCombatHpBar, type CombatHpBarView } from '../debug/debugCombatHpBar';
import { flashOverlay } from '../debug/debugCombatFlash';
import {  createCombatSessionFromPresetId,
  getCombatSessionActiveSheet,
  getCombatSessionAvailableActions,
  getCombatSessionLife,
  getCombatSessionOutcome,
  type CombatSession,
  resolveCombatSessionBasicAttack,
  resolveCombatSessionPrimaryAbility,
  resolveCombatSessionAction,
  advanceCombatSessionTurn,
  runCombatSessionOpponentAction,
  getCombatSessionActiveParticipant,
  getCombatSessionPositioning,
  getCombatSessionRemainingMovement,
  moveCombatSessionActiveParticipant,
  restartCombatSession,
  getCombatSessionSheet,
} from '../../combat/combatSession';
import { createTurnIndicator, type TurnIndicatorView } from '../debug/debugCombatTurnIndicator';
import { showOutcomeBanner, type OutcomeBannerView } from '../debug/debugCombatOutcomeBanner';
import { createDebugCombatGridView, type DebugCombatGridView } from '../debug/debugCombatGridView';
import { projectCombatPointerToCell, type DebugCombatGridLayout } from '../debug/debugCombatGridProjection';
import { projectDebugCombatAttackAvailability } from '../debug/debugCombatAttackAvailability';
import { debugCombatModeAllowsMovement, returnToDebugCombatMainMode, type DebugCombatInteractionMode } from '../debug/debugCombatInteractionMode';
import { COMBAT_FIXTURE_IDS } from '../../rules/combatFixtures';
import { calculateCombatLayout } from '../debug/combatLayoutHelper';
import { createCombatMenuView, type CombatMenuView } from '../visual/combatMenuView';
import { MotionCoordinator } from '../visual/motionCoordinator';
import { mapAttackToEvents, mapMovementToEvent, type PresentationEvent } from '../visual/presentationEvents';
import {
  getPresentationMode,
  setPresentationMode,
  togglePresentationMode,
  isElementVisible,
  type PresentationMode,
} from '../visual/presentationState';
import { queueVisualAssets } from '../visual/loadVisualAssets';
import { VISUAL_ASSET_KEYS } from '../visual/assetKeys';
import { getCombatPromptIconPlacements } from '../visual/combatPromptIconLayout';
import { createActorAnimations } from '../visual/actorAnimations';

const DEBUG_READY_STATUS = 'status: ready';

const gameLocalRoller = {
  rollD20: () => Math.floor(Math.random() * 20) + 1,
};

export class PrototypeScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;

  private debugActorController?: DebugActorController;

  private debugCameraController?: DebugCameraController;

  private combatCameraIsolation?: CombatCameraIsolation;

  private debugHudTexts?: ReturnType<typeof createDebugHud>;

  private debugExplorationMapGraphics?: ExplorationMapView;

  private debugLegendContainer?: Phaser.GameObjects.Container;

  private presentationMode: PresentationMode = getPresentationMode();

  private acknowledgementText?: Phaser.GameObjects.Text;

  private interactionFeedbackText?: Phaser.GameObjects.Text;

  private interactionFeedbackTimer?: Phaser.Time.TimerEvent;

  private currentInteractionFeedback?: InteractionFeedback;

  private mode: 'exploration' | 'combat' = 'exploration';

  private combatSession?: CombatSession;

  private combatMenuState: DebugCombatInteractionMode = 'main';

  private combatLogHistory: string[] = [];

  private combatConsolePanel?: Phaser.GameObjects.Graphics;
  private combatConsoleBgNineSlice?: any;
  private combatConsoleBorderNineSlice?: any;
  private attackIconSprite?: Phaser.GameObjects.Sprite;
  private endTurnIconSprite?: Phaser.GameObjects.Sprite;
  private moveIconSprite?: Phaser.GameObjects.Sprite;

  private combatConsoleHistoryText?: Phaser.GameObjects.Text;

  private combatConsolePromptsText?: Phaser.GameObjects.Text;

  private explorationPlaceholderText?: Phaser.GameObjects.Text;

  private combatHpBars?: CombatHpBarView[];

  private combatTurnIndicator?: TurnIndicatorView;

  private combatOutcomeBanner?: OutcomeBannerView;

  private combatGridView?: DebugCombatGridView;

  private combatGridLayout?: DebugCombatGridLayout;

  private combatMenuView?: CombatMenuView;

  private motionCoordinator?: MotionCoordinator;

  private transientFeedback: { destroy: () => void }[] = [];

  private clearTransientFeedback(): void {
    if (this.motionCoordinator && this.combatSession) {
      try {
        this.motionCoordinator.cancelAll(this.combatSession);
      } catch (e) {
        // ignore
      }
    }
    if (this.transientFeedback) {
      this.transientFeedback.forEach(handle => {
        try {
          handle.destroy();
        } catch (e) {
          // ignore
        }
      });
      this.transientFeedback = [];
    }
  }

  constructor() {
    super('PrototypeScene');
  }

  preload(): void {
    queueVisualAssets(this);
  }

  create(): void {
    const { width, height } = this.scale;
    createActorAnimations(this);
    const initialMap = createDebugExplorationMap(DEBUG_INTEREST_POINTS);

    this.events.once('shutdown', () => {
      this.clearTransientFeedback();
      this.clearInteractionFeedback();
      this.combatCameraIsolation?.destroy(this.children.list);
    });
    this.events.once('destroy', () => {
      this.clearTransientFeedback();
      this.clearInteractionFeedback();
      this.combatCameraIsolation?.destroy(this.children.list);
    });

    this.cameras.main.setBackgroundColor('#10141b');
    this.debugCameraController = new DebugCameraController(this);
    this.debugExplorationMapGraphics = drawExplorationMap(this, initialMap);
    this.debugLegendContainer = drawExplorationLegend(this);

    const explorationEntity = createExplorableEntity(
      'debug-entity-1',
      'Explorer Token',
      DEBUG_EXPLORATION_ENTITY_START_CELL,
    );

    this.debugActorController = new DebugActorController(
      this,
      explorationEntity,
      DEBUG_INTEREST_POINTS,
      {
        onStateChanged: () => {
          this.updateDebugText('status: resolved (movement auto-complete)');
        },
        onMapChanged: (map) => {
          if (this.debugExplorationMapGraphics) {
            redrawExplorationMap(this.debugExplorationMapGraphics, map);
          }
        },
      },
    );

    this.titleText = this.add
      .text(width / 2, 24, getPrototypeLabel(), {
        color: '#f4f0e8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.debugHudTexts = createDebugHud(
      this,
      this.formatDebugHudSections(DEBUG_READY_STATUS),
    );

    this.interactionFeedbackText = this.add
      .text(width / 2, height - 52, '', {
        color: '#f2c14e',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        align: 'center',
        backgroundColor: '#10141be6',
        padding: { x: 8, y: 5 },
        fixedWidth: Math.min(320, width - 32),
        wordWrap: { width: Math.min(304, width - 48), useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);

    this.explorationPlaceholderText = this.add
      .text(width / 2, height - 28, 'exploration placeholder / debug movement', {
        color: '#8fb8de',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.keyboard?.on('keydown-SPACE', this.handleCompleteMove, this);
    this.input.keyboard?.on('keydown-F', this.handleInteract, this);
    this.input.keyboard?.on('keydown-ONE', this.handleKeyOne, this);
    this.input.keyboard?.on('keydown-TWO', this.handleKeyTwo, this);
    this.input.keyboard?.on('keydown-THREE', this.handleKeyThree, this);
    this.input.keyboard?.on('keydown-ZERO', this.handleKeyZero, this);
    this.input.keyboard?.on('keydown-ESC', this.handleCombatReturn, this);
    this.input.keyboard?.on('keydown-R', this.handleCombatReset, this);
    this.input.keyboard?.on('keydown-D', this.handleTogglePresentationMode, this);

    const consolePanel = this.add.graphics().setScrollFactor(0).setVisible(false);
    this.combatConsolePanel = consolePanel;

    if (this.textures.exists(VISUAL_ASSET_KEYS.panelTexture)) {
      this.combatConsoleBgNineSlice = this.add.nineslice(
        0, 0,
        VISUAL_ASSET_KEYS.panelTexture,
        undefined,
        32, 32,
        16, 16, 16, 16
      ).setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    }
    if (this.textures.exists(VISUAL_ASSET_KEYS.borderTexture)) {
      this.combatConsoleBorderNineSlice = this.add.nineslice(
        0, 0,
        VISUAL_ASSET_KEYS.borderTexture,
        undefined,
        32, 32,
        16, 16, 16, 16
      ).setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    }

    if (this.textures.exists(VISUAL_ASSET_KEYS.attackIcon)) {
      this.attackIconSprite = this.add.sprite(0, 0, VISUAL_ASSET_KEYS.attackIcon).setScrollFactor(0).setVisible(false).setOrigin(0, 0.5);
    }
    if (this.textures.exists(VISUAL_ASSET_KEYS.endTurnIcon)) {
      this.endTurnIconSprite = this.add.sprite(0, 0, VISUAL_ASSET_KEYS.endTurnIcon).setScrollFactor(0).setVisible(false).setOrigin(0, 0.5);
    }
    if (this.textures.exists(VISUAL_ASSET_KEYS.moveIcon)) {
      this.moveIconSprite = this.add.sprite(0, 0, VISUAL_ASSET_KEYS.moveIcon).setScrollFactor(0).setVisible(false).setOrigin(0, 0.5);
    }

    this.combatConsoleHistoryText = this.add
      .text(0, 0, '', {
        color: '#c8d3df',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineSpacing: 2,
      })
      .setScrollFactor(0)
      .setVisible(false);

    this.combatConsolePromptsText = this.add
      .text(0, 0, '', {
        color: '#f2c14e',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setVisible(false);

    this.updateLayout(width, height);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const currentWidth = gameSize.width;
      const currentHeight = gameSize.height;
      this.updateLayout(currentWidth, currentHeight);
      if (this.combatSession && this.motionCoordinator) {
        this.motionCoordinator.cancelAll(this.combatSession);
      }
      if (this.combatSession && this.combatGridView) {
        const playerSheetForGrid = this.combatSession.preset.sheets.find((sheet) => sheet.participantId === COMBAT_FIXTURE_IDS.player);
        const targetSheet = playerSheetForGrid && this.combatSession.preset.sheets.find((sheet) => sheet.teamId !== playerSheetForGrid.teamId);
        this.combatGridView.update(this.combatSession, {
          interactionMode: this.combatMenuState,
          targetParticipantId: this.combatMenuState === 'main' ? undefined : targetSheet?.participantId,
        });
      }
      if (this.combatSession && this.combatHpBars) {
        this.rebuildCombatHpBars(currentWidth, currentHeight);
      }
      this.applyPresentationMode();
    }, this);

    this.applyPresentationMode();
  }

  update(_time: number, delta: number): void {
    this.debugCameraController?.update(delta, getCameraControlPolicy(this.mode));
    this.combatCameraIsolation?.sync(this.children.list);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.mode === 'combat') {
      this.debugActorController?.clearPathPreview();
      this.handleCombatPointerDown(pointer);
      return;
    }
    const localPosition = {
      x: pointer.worldX - DEBUG_EXPLORATION_GRID.originX,
      y: pointer.worldY - DEBUG_EXPLORATION_GRID.originY,
    };
    const cell = worldToGrid(localPosition, DEBUG_EXPLORATION_GRID.cellSize);
    const actorCell = this.debugActorController?.getCurrentCell();

    if (!actorCell) {
      this.debugActorController?.selectCell(cell);
      this.debugActorController?.clearPathPreview();
      this.updateDebugText('status: blocked (out of range)');
      return;
    }

    const pathResult = findOrthogonalPath(
      this.getCurrentExplorationMap(),
      actorCell,
      cell,
      DEBUG_ACTOR_MOVE_RANGE,
    );

    if (!pathResult.found && pathResult.reason === 'outside_grid') {
      this.debugActorController?.clearSelectedCell();
      this.updateDebugText('status: blocked (outside grid)');
      return;
    }

    this.debugActorController?.selectCell(cell);

    if (this.debugActorController?.isMoving()) {
      this.debugActorController?.clearPathPreview();
      this.updateDebugText('status: blocked (actor moving)');
      return;
    }

    if (!pathResult.found) {
      this.debugActorController?.clearPathPreview();
      this.handleBlockedPath(cell, pathResult);
      return;
    }

    this.debugActorController?.drawPathPreview(pathResult.path);

    const moveResult = this.debugActorController?.startMoveAlongPath(pathResult.path);

    if (moveResult?.accepted) {
      this.updateDebugText(
        `status: move accepted (${moveResult.targetCell.x},${moveResult.targetCell.y})`,
      );
      return;
    }

    this.updateDebugText('status: blocked (actor moving)');
  }

  private handleCombatPointerDown(pointer: Phaser.Input.Pointer): void {
    const session = this.combatSession;
    const layout = this.combatGridLayout;
    if (!session || !layout) return;
    if (!debugCombatModeAllowsMovement(this.combatMenuState)) return;

    const pointerWorld = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const destination = projectCombatPointerToCell(
      pointerWorld,
      layout,
      getCombatSessionPositioning(session).bounds,
    );
    if (!destination) return;

    const playerSheet = session.preset.sheets[0];
    const active = getCombatSessionActiveParticipant(session);
    if (!playerSheet || active?.id !== playerSheet.participantId) {
      this.logToCombatConsole('[Move blocked] not_player_turn');
      this.updateDebugText('status: movement blocked (not player turn)');
      return;
    }

    const result = moveCombatSessionActiveParticipant(session, {
      participantId: playerSheet.participantId,
      destination,
    });
    if (!result.ok) {
      this.logToCombatConsole(`[Move blocked] ${result.error.code}`);
      this.updateDebugText(`status: movement blocked (${result.error.code})`);
      return;
    }

    this.logToCombatConsole(
      `[Move] ${playerSheet.displayName}: (${result.from.x},${result.from.y}) -> (${result.destination.x},${result.destination.y}), ${result.remainingMovement} remaining.`,
    );
    this.updateDebugText('status: combat movement resolved');
  }

  private handleBlockedPath(
    cell: GridCell,
    result: OrthogonalPathFailure,
  ): void {
    this.debugActorController?.selectCell(cell);

    switch (result.reason) {
      case 'blocked_destination':
        this.updateDebugText('status: blocked (blocked destination)');
        return;
      case 'no_path':
        this.updateDebugText('status: blocked (no path)');
        return;
      case 'out_of_range':
        this.updateDebugText('status: blocked (out of range)');
        return;
      case 'blocked_origin':
        this.updateDebugText('status: blocked (blocked origin)');
        return;
      case 'outside_grid':
        this.debugActorController?.clearSelectedCell();
        this.updateDebugText('status: blocked (outside grid)');
        return;
    }
  }

  private handleCompleteMove(): void {
    if (this.mode === 'combat') {
      return;
    }
    const completedMove = this.debugActorController?.completeMove() ?? false;

    this.updateDebugText(completedMove ? 'status: resolved (movement complete)' : DEBUG_READY_STATUS);
  }

  private handleInteract(): void {
    if (this.mode === 'combat') {
      this.debugActorController?.clearPathPreview();
      this.updateDebugText('status: interaction blocked (combat mode)');
      return;
    }

    const interactionResult = this.debugActorController?.tryInteract();

    if (!interactionResult) {
      this.updateDebugText('status: interaction unavailable');
      return;
    }

    if (!interactionResult.interacted) {
      if (interactionResult.reason === 'actor_moving') {
        this.updateDebugText('status: interaction blocked (actor moving)');
        return;
      }

      if (interactionResult.reason === 'locked') {
        this.updateDebugText(
          `status: interaction locked (${this.formatPointLabel(interactionResult.point)})`,
        );
        return;
      }

      this.updateDebugText('status: interaction unavailable');
      return;
    }

    const result = interactionResult.result;
    if (result.effect.type === 'combat_triggered') {
      // Combat uses screen-space UI and a viewport-derived arena. Do not inherit a
      // zoomed or panned exploration camera after exploration controls are disabled.
      resetWorldCamera(this.cameras.main);
      this.debugActorController?.clearPathPreview();
      this.debugActorController?.setVisible(false);
      this.debugExplorationMapGraphics?.setVisible(false);
      this.mode = 'combat';
      this.combatMenuState = 'main';
      this.combatSession = createCombatSessionFromPresetId(
        result.effect.encounterPresetId,
        { roller: gameLocalRoller }
      );

      const { width, height } = this.scale;
      const layout = calculateCombatLayout(width, height);
      this.combatGridView?.destroy();
      this.combatGridLayout = {
        originX: layout.grid.originX,
        originY: layout.grid.originY,
        cellSize: layout.grid.cellSize,
      };
      this.combatGridView = createDebugCombatGridView(this, this.combatGridLayout);

      const createCoordinatorCallbacks = () => ({
        updateHpBars: () => {
          if (this.combatSession && this.combatHpBars) {
            this.combatSession.preset.sheets.forEach((sheet, idx) => {
              const bar = this.combatHpBars?.[idx];
              const life = getCombatSessionLife(this.combatSession!, sheet.participantId);
              if (bar && life) {
                bar.update(life.current, life.maximum);
              }
            });
          }
        },
        updateTurnIndicator: () => {
          if (this.combatSession && this.combatTurnIndicator) {
            const activeSheet = getCombatSessionActiveSheet(this.combatSession);
            const playerSheet = this.combatSession.preset.sheets[0];
            if (activeSheet && playerSheet) {
              const isPlayerTurn = activeSheet.participantId === playerSheet.participantId;
              this.combatTurnIndicator.update(activeSheet.displayName, isPlayerTurn);
            }
          }
        },
        showOutcomeBanner: (status: 'victory' | 'defeat') => {
          const { width, height } = this.scale;
          if (!this.combatOutcomeBanner) {
            this.combatOutcomeBanner = showOutcomeBanner(this, status, width, height);
            this.combatCameraIsolation?.registerUi(this.combatOutcomeBanner.container);
          }
        },
        logToConsole: (msg: string) => {
          this.logToCombatConsole(msg);
        }
      });

      this.motionCoordinator = new MotionCoordinator(this, this.combatGridView, createCoordinatorCallbacks());
      this.combatGridView.update(this.combatSession);
      this.combatTurnIndicator = createTurnIndicator(this, width / 2, 48);
      this.combatMenuView = createCombatMenuView(this);

      this.rebuildCombatHpBars(width, height);

      this.activateCombatCameraIsolation(width, height);

      this.updateLayout(width, height);

      const feedback = getInteractionFeedback(result);
      this.updateDebugText(feedback.debugMessage);
      return;
    }

    const feedback = getInteractionFeedback(result);
    this.updateDebugText(feedback.debugMessage);
    this.showInteractionFeedback(feedback);
  }


  private getCurrentExplorationMap() {
    return this.debugActorController?.getExplorationMap()
      ?? createDebugExplorationMap(DEBUG_INTEREST_POINTS);
  }

  private formatCombatHudSections(selectionText: string): DebugHudSections {
    const session = this.combatSession;
    if (!session) {
      return {
        objective: 'objective\ncombat session unavailable',
        interaction: 'interaction\nnone',
        entity: 'entity\nnone',
        world: 'world\nnone',
        move: `move\n${selectionText}`,
      };
    }

    const outcome = getCombatSessionOutcome(session);
    const activeSheet = getCombatSessionActiveSheet(session);
    const avail = getCombatSessionAvailableActions(session);

    const actionLines = avail
      ? avail.actions.map((action) => `- action: ${action.label} (check: +${action.checkModifier}, dmg: ${action.damageBase})`)
      : [];
    const abilityLines = avail
      ? avail.abilities.map((ability) => `- ability: ${ability.label} (cost: ${ability.cost.amount} ${ability.cost.resourceLabel})`)
      : [];

    const playerSheet = session.preset.sheets[0];
    let outcomePrompt = '';
    if (outcome.status === 'resolved') {
      if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
        outcomePrompt = 'Press [D] or [ESC] to return to exploration';
      } else {
        outcomePrompt = 'Press [R] to restart combat';
      }
    }

    return {
      objective: [
        'objective',
        'combat encounter',
        `preset: ${session.preset.label} (${session.preset.id})`,
        `status: ${outcome.status}`,
      ].join('\n'),
      interaction: [
        'interaction',
        'combat turn',
        `active: ${activeSheet?.displayName ?? 'none'}`,
      ].join('\n'),
      entity: [
        'entity',
        'combatants',
        ...session.preset.sheets.map((sheet) => {
          const life = getCombatSessionLife(session, sheet.participantId);
          return `- ${sheet.displayName}: ${life?.current ?? 0}/${life?.maximum ?? 0} HP`;
        }),
      ].join('\n'),
      world: [
        'world',
        'actions',
        ...actionLines,
        ...abilityLines,
        '- end turn option: automatic',
      ].join('\n'),
      move: [
        'move',
        'combat controls',
        'movements blocked',
        selectionText,
        ...(outcomePrompt ? [outcomePrompt] : []),
      ].join('\n'),
    };
  }

  private updateDebugText(selectionText: string): void {
    if (!this.debugHudTexts) {
      return;
    }

    const sections = this.formatDebugHudSections(selectionText);
    updateDebugHud(this.debugHudTexts, sections);

    if (this.mode === 'combat') {
      this.debugHudTexts.objective.setVisible(false);
      this.debugHudTexts.interaction.setVisible(false);
      this.debugHudTexts.entity.setVisible(false);
      this.debugHudTexts.world.setVisible(false);
      this.debugHudTexts.move.setVisible(false);

      if (this.combatSession && this.combatHpBars && (!this.motionCoordinator || !this.motionCoordinator.isPlaying)) {
        this.combatSession.preset.sheets.forEach((sheet, idx) => {
          const bar = this.combatHpBars?.[idx];
          const life = getCombatSessionLife(this.combatSession!, sheet.participantId);
          if (bar && life) {
            bar.update(life.current, life.maximum);
          }
        });
      }

      if (this.combatSession) {
        const currentOutcome = getCombatSessionOutcome(this.combatSession);
        if (currentOutcome.status === 'resolved') this.combatMenuState = 'main';
        const playerSheetForGrid = this.combatSession.preset.sheets.find((sheet) => sheet.participantId === COMBAT_FIXTURE_IDS.player);
        const targetSheet = playerSheetForGrid && this.combatSession.preset.sheets.find((sheet) => sheet.teamId !== playerSheetForGrid.teamId);
        this.combatGridView?.update(this.combatSession, {
          interactionMode: this.combatMenuState,
          targetParticipantId: this.combatMenuState === 'main' ? undefined : targetSheet?.participantId,
        });
        if (this.combatTurnIndicator) {
          const activeSheet = getCombatSessionActiveSheet(this.combatSession);
          const playerSheet = this.combatSession.preset.sheets[0];
          if (activeSheet && playerSheet) {
            const isPlayerTurn = activeSheet.participantId === playerSheet.participantId;
            this.combatTurnIndicator.update(activeSheet.displayName, isPlayerTurn);
          }
        }

        const outcome = getCombatSessionOutcome(this.combatSession);
        const playerSheet = this.combatSession.preset.sheets[0];
        if (outcome.status === 'resolved' && !this.combatOutcomeBanner && (!this.motionCoordinator || !this.motionCoordinator.isPlaying)) {
          const { width, height } = this.scale;
          if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
            this.combatOutcomeBanner = showOutcomeBanner(this, 'victory', width, height);
            this.combatCameraIsolation?.registerUi(this.combatOutcomeBanner.container);
          } else {
            this.combatOutcomeBanner = showOutcomeBanner(this, 'defeat', width, height);
            this.combatCameraIsolation?.registerUi(this.combatOutcomeBanner.container);
          }
        }
      }

      this.debugLegendContainer?.setVisible(false);
      this.explorationPlaceholderText?.setVisible(false);
      this.setConsolePanelVisible(true);
      this.combatConsoleHistoryText?.setVisible(true);
      this.combatConsolePromptsText?.setVisible(true);

      if (this.combatSession) {
        const outcome = getCombatSessionOutcome(this.combatSession);
        const playerSheet = this.combatSession.preset.sheets[0];
        let promptText = '';
        const layout = calculateCombatLayout(this.scale.width, this.scale.height);
        
        if (outcome.status === 'resolved') {
          if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
            promptText = '[3] Return to exploration';
          } else {
            promptText = '[R] Restart combat';
          }
          this.combatConsolePromptsText?.setVisible(true).setText(promptText);
          this.combatMenuView?.setVisible(false);
        } else {
          if (this.combatMenuState === 'main') {
            promptText = this.combatSession.encounter.activeTurn.mainActionAvailable
              ? `[1] Attacks    [2] Abilities\n[3] End Turn    Move: ${getCombatSessionRemainingMovement(this.combatSession)}/4`
              : `Main action used\n[3] End Turn    Move: ${getCombatSessionRemainingMovement(this.combatSession)}/4`;
            this.combatConsolePromptsText?.setVisible(true).setText(promptText);
            this.combatMenuView?.setVisible(false);
          } else if (this.combatMenuState === 'attacks') {
            const availability = projectDebugCombatAttackAvailability(this.combatSession, COMBAT_FIXTURE_IDS.player);
            this.combatConsolePromptsText?.setVisible(false).setText('');
            this.combatMenuView?.setVisible(true);
            this.combatMenuView?.update(availability, layout.console.promptsX, layout.console.promptsAttacksY);
          } else if (this.combatMenuState === 'abilities') {
            promptText = '[1]      Focused Drive (2 PM)    [0] Back';
            this.combatConsolePromptsText?.setVisible(true).setText(promptText);
            this.combatMenuView?.setVisible(false);
          }
        }
        if (this.combatConsolePromptsText) {
          this.combatConsolePromptsText.y = this.combatMenuState === 'attacks' ? layout.console.promptsAttacksY : layout.console.promptsNormalY;
        }
      }

      this.updateLayout(this.scale.width, this.scale.height);
    } else {
      this.debugLegendContainer?.setVisible(true);
      this.explorationPlaceholderText?.setVisible(true);
      this.setConsolePanelVisible(false);
      this.combatConsoleHistoryText?.setVisible(false);
      this.combatConsolePromptsText?.setVisible(false);

      this.updateLayout(this.scale.width, this.scale.height);
    }

    this.applyPresentationMode();
  }

  private formatDebugHudSections(selectionText: string) {
    if (this.mode === 'combat') {
      return this.formatCombatHudSections(selectionText);
    }
    return this.debugActorController?.buildDebugHudSections(selectionText) ?? {
      objective: ['objective', 'objective: unavailable'].join('\n'),
      interaction: ['interaction', 'status: none'].join('\n'),
      entity: ['entity', 'actor: unavailable'].join('\n'),
      world: ['world', 'switches: none'].join('\n'),
      move: ['move', selectionText].join('\n'),
    };
  }

  private formatPointLabel(
    point: InterestPointInteractionResult['point'],
  ): string {
    return point.kind === 'exit_marker'
      ? `exit marker: ${point.label}`
      : `${point.kind}: ${point.label}`;
  }

  private setConsolePanelVisible(visible: boolean): void {
    const hasTextures = !!(this.textures.exists(VISUAL_ASSET_KEYS.panelTexture) && this.textures.exists(VISUAL_ASSET_KEYS.borderTexture));
    if (hasTextures) {
      this.combatConsoleBgNineSlice?.setVisible(visible);
      this.combatConsoleBorderNineSlice?.setVisible(visible);
      this.combatConsolePanel?.setVisible(false);
    } else {
      this.combatConsoleBgNineSlice?.setVisible(false);
      this.combatConsoleBorderNineSlice?.setVisible(false);
      this.combatConsolePanel?.setVisible(visible);
    }
  }

  private logToCombatConsole(message: string): void {
    this.combatLogHistory.push(message);
    if (this.combatLogHistory.length > 4) {
      this.combatLogHistory.shift();
    }
    if (this.combatConsoleHistoryText) {
      this.combatConsoleHistoryText.setText(this.combatLogHistory.join('\n'));
    }
  }

  private executeCombatAction(actionId: string): void {
    if (!this.combatSession) return;
    const res = resolveCombatSessionAction(this.combatSession, actionId);
    if (res.ok) {
      this.combatMenuState = 'main';
      // Sync HUD and grid states first
      this.updateDebugText('status: attack resolved');

      const playerSheet = this.combatSession.preset.sheets[0];
      const targetLife = getCombatSessionLife(this.combatSession, res.target.participantId);
      const isTargetDefeated = targetLife ? targetLife.current <= 0 : false;
      const events = mapAttackToEvents(res, playerSheet.teamId, isTargetDefeated);
      this.motionCoordinator?.play(events);

      const damageApplied = res.result.damage.applied ? res.result.damage.amount : 0;
      const logMsg = `[${res.attacker.displayName}] ${res.action.label} rolls d20: [${res.roll}] + Mod [${res.action.checkModifier}] = ${res.roll + res.action.checkModifier} vs Def [${res.target.defense.value}] -> ${res.result.outcome === 'hit' ? 'Hit!' : 'Miss.'} (Dmg: ${damageApplied} HP)`;
      this.logToCombatConsole(logMsg);

      const outcome = getCombatSessionOutcome(this.combatSession);
      if (outcome.status === 'resolved') {
        if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
          this.logToCombatConsole('[Victory] Hero won! Press [3] to return.');
        } else {
          this.logToCombatConsole('[Defeat] Hero was defeated. Press [R] to restart.');
        }
      }
    } else {
      const err = res.error;
      if (err.code === 'attack_out_of_range') {
        const attackerSheet = getCombatSessionSheet(this.combatSession, err.attackerId);
        const weapon = attackerSheet.weapons.find(w => w.weaponId === err.weaponId);
        const weaponLabel = weapon?.label ?? err.weaponId;
        this.logToCombatConsole(`[Attack blocked] ${weaponLabel}: distance ${err.distance}, range ${err.maximumDistance}.`);
      } else {
        this.logToCombatConsole(`[Error] ${err.code}`);
      }
      this.updateDebugText('status: attack failed');
    }
  }

  private handleKeyOne(): void {
    if (this.mode !== 'combat' || !this.combatSession) {
      return;
    }
    if (this.combatMenuState === 'main') {
      if (!this.combatSession.encounter.activeTurn.mainActionAvailable) {
        this.logToCombatConsole('[Action blocked] main_action_unavailable');
        this.updateDebugText('status: main action unavailable');
        return;
      }
      this.combatMenuState = 'attacks';
      this.updateDebugText('status: attacks menu');
    } else if (this.combatMenuState === 'attacks') {
      this.executeCombatAction('basic_strike');
    } else if (this.combatMenuState === 'abilities') {
      const res = resolveCombatSessionPrimaryAbility(this.combatSession);
      if (res.ok) {
        this.combatMenuState = 'main';
        // Update/redraw state first
        this.updateDebugText('status: ability resolved');

        const playerSheet = this.combatSession.preset.sheets[0];
        const targetLife = getCombatSessionLife(this.combatSession, res.target.participantId);
        const isTargetDefeated = targetLife ? targetLife.current <= 0 : false;
        const events = mapAttackToEvents(res, playerSheet.teamId, isTargetDefeated);
        this.motionCoordinator?.play(events);

        const damageApplied = res.result.damage.applied ? res.result.damage.amount : 0;
        const logMsg = `[Hero] Focused Drive (2 PM) rolls d20: [${res.roll}] + Mod [${res.action.checkModifier}] = ${res.roll + res.action.checkModifier} vs Def [${res.target.defense.value}] -> ${res.result.outcome === 'hit' ? 'Hit!' : 'Miss.'} (Dmg: ${damageApplied} HP)`;
        this.logToCombatConsole(logMsg);

        const outcome = getCombatSessionOutcome(this.combatSession);
        if (outcome.status === 'resolved') {
          if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
            this.logToCombatConsole('[Victory] Hero won! Press [3] to return.');
          } else {
            this.logToCombatConsole('[Defeat] Hero was defeated. Press [R] to restart.');
          }
        }
      } else {
        const err = res.error;
        if (err.code === 'attack_out_of_range') {
          const attackerSheet = getCombatSessionSheet(this.combatSession, err.attackerId);
          const weapon = attackerSheet.weapons.find(w => w.weaponId === err.weaponId);
          const weaponLabel = weapon?.label ?? err.weaponId;
          this.logToCombatConsole(`[Attack blocked] ${weaponLabel}: distance ${err.distance}, range ${err.maximumDistance}.`);
        } else {
          this.logToCombatConsole(`[Error] ${err.code}`);
        }
        this.updateDebugText('status: ability failed');
      }
    }
  }

  private handleKeyTwo(): void {
    if (this.mode !== 'combat' || !this.combatSession) {
      return;
    }
    if (this.combatMenuState === 'main') {
      if (!this.combatSession.encounter.activeTurn.mainActionAvailable) {
        this.logToCombatConsole('[Action blocked] main_action_unavailable');
        this.updateDebugText('status: main action unavailable');
        return;
      }
      this.combatMenuState = 'abilities';
      this.updateDebugText('status: abilities menu');
    } else if (this.combatMenuState === 'attacks') {
      this.executeCombatAction('crossbow_strike');
    }
  }

  private handleKeyThree(): void {
    if (this.mode !== 'combat' || !this.combatSession) {
      return;
    }
    if (this.combatMenuState === 'attacks') {
      this.executeCombatAction('bow_strike');
      return;
    }
    const outcome = getCombatSessionOutcome(this.combatSession);
    const playerSheet = this.combatSession.preset.sheets[0];
    if (outcome.status === 'resolved') {
      if (playerSheet && outcome.winningTeamId === playerSheet.teamId) {
        this.handleCombatReturn();
        return;
      }
    }

    if (outcome.status === 'ongoing' && this.combatMenuState === 'main') {
      const active = getCombatSessionActiveParticipant(this.combatSession);
      if (!active || !playerSheet || active.id !== playerSheet.participantId) {
        this.updateDebugText('status: blocked (not player turn)');
        return;
      }

      const events: PresentationEvent[] = [];
      const opponentSheet = this.combatSession.preset.sheets[1];
      if (opponentSheet) {
        events.push({
          type: 'turn_changed',
          activeParticipantId: opponentSheet.participantId,
          displayName: opponentSheet.displayName,
          isPlayerTurn: false,
        });
      }

      const advanceResult = advanceCombatSessionTurn(this.combatSession);
      if (advanceResult.ok) {
        this.logToCombatConsole('[Turn] Hero ends turn. Opponent turn starts.');
        const nextActive = getCombatSessionActiveParticipant(this.combatSession);
        if (nextActive && opponentSheet && nextActive.id === opponentSheet.participantId) {
          const opResult = runCombatSessionOpponentAction(this.combatSession);
          if (opResult.ok) {
            const targetLife = getCombatSessionLife(this.combatSession, opResult.attack.target.participantId);
            const isTargetDefeated = targetLife ? targetLife.current <= 0 : false;
            const attackEvents = mapAttackToEvents(opResult.attack, playerSheet.teamId, isTargetDefeated);
            events.push(...attackEvents);

            const damageApplied = opResult.attack.result.damage.applied ? opResult.attack.result.damage.amount : 0;
            const logMsg = `[Gargoyle] Raider Strike rolls d20: [${opResult.attack.roll}] + Mod [${opResult.attack.action.checkModifier}] = ${opResult.attack.roll + opResult.attack.action.checkModifier} vs Def [${opResult.attack.target.defense.value}] -> ${opResult.attack.result.outcome === 'hit' ? 'Hit!' : 'Miss.'} (Dmg: ${damageApplied} HP)`;
            this.logToCombatConsole(logMsg);

            const postEnemyOutcome = getCombatSessionOutcome(this.combatSession);
            if (postEnemyOutcome.status === 'resolved') {
              if (playerSheet && postEnemyOutcome.winningTeamId === playerSheet.teamId) {
                this.logToCombatConsole('[Victory] Hero won! Press [3] to return.');
              } else {
                this.logToCombatConsole('[Defeat] Hero was defeated. Press [R] to restart.');
              }
            }
          } else {
            const err = opResult.error;
            this.logToCombatConsole(`[Enemy Action Error] ${err.code}`);
            const forceEnd = advanceCombatSessionTurn(this.combatSession);
            if (forceEnd.ok) {
              this.logToCombatConsole('[Turn] Opponent turn ended (no action). Hero turn starts.');
            }
          }
        }

        events.push({
          type: 'turn_changed',
          activeParticipantId: playerSheet.participantId,
          displayName: playerSheet.displayName,
          isPlayerTurn: true,
        });

        this.updateDebugText('status: turn advanced');
        this.motionCoordinator?.play(events);
      } else {
        this.updateDebugText(`status: turn advance failed (${advanceResult.error.code})`);
      }
    }
  }

  private handleKeyZero(): void {
    if (this.mode !== 'combat') {
      return;
    }
    if (this.combatMenuState === 'abilities' || this.combatMenuState === 'attacks') {
      this.combatMenuState = returnToDebugCombatMainMode(this.combatMenuState);
      this.updateDebugText('status: combat');
    }
  }

  private handleCombatReturn(): void {
    this.clearTransientFeedback();
    if (this.mode !== 'combat' || !this.combatSession) {
      return;
    }
    const outcome = getCombatSessionOutcome(this.combatSession);
    const playerSheet = this.combatSession.preset.sheets[0];
    if (playerSheet && outcome.status === 'resolved' && outcome.winningTeamId === playerSheet.teamId) {
      if (this.combatHpBars) {
        this.combatHpBars.forEach(bar => bar.destroy());
        this.combatHpBars = undefined;
      }
      this.combatGridView?.destroy();
      this.combatGridView = undefined;
      this.combatGridLayout = undefined;
      if (this.combatMenuView) {
        this.combatMenuView.destroy();
        this.combatMenuView = undefined;
      }
      this.combatSession = undefined;
      this.mode = 'exploration';
      this.deactivateCombatCameraIsolation();
      // Returning to exploration follows the same deterministic camera policy.
      resetWorldCamera(this.cameras.main);
      this.debugActorController?.setVisible(true);
      this.debugExplorationMapGraphics?.setVisible(true);

      this.setConsolePanelVisible(false);
      this.combatConsoleHistoryText?.setVisible(false);
      this.combatConsolePromptsText?.setVisible(false);
      this.explorationPlaceholderText?.setVisible(true);

      if (this.combatTurnIndicator) {
        this.combatTurnIndicator.destroy();
        this.combatTurnIndicator = undefined;
      }
      if (this.combatOutcomeBanner) {
        this.combatOutcomeBanner.destroy();
        this.combatOutcomeBanner = undefined;
      }

      this.updateDebugText('status: ready');
    }
  }

  private handleCombatReset(): void {
    this.clearTransientFeedback();
    if (this.mode !== 'combat' || !this.combatSession) {
      return;
    }
    this.combatLogHistory = [];
    this.combatConsoleHistoryText?.setText('');
    restartCombatSession(this.combatSession);
    resetWorldCamera(this.cameras.main);
    this.combatMenuState = 'main';
    this.combatGridView?.update(this.combatSession, { interactionMode: 'main' });

    if (this.combatMenuView) {
      this.combatMenuView.destroy();
      this.combatMenuView = undefined;
    }
    this.combatMenuView = createCombatMenuView(this);
    this.combatCameraIsolation?.registerUi(this.combatMenuView.container);

    if (this.combatTurnIndicator) {
      this.combatTurnIndicator.destroy();
      this.combatTurnIndicator = undefined;
    }
    if (this.combatOutcomeBanner) {
      this.combatOutcomeBanner.destroy();
      this.combatOutcomeBanner = undefined;
    }

    this.rebuildCombatHpBars(this.scale.width, this.scale.height);
    this.combatTurnIndicator = createTurnIndicator(this, this.scale.width / 2, 48);
    this.combatCameraIsolation?.registerUi(this.combatTurnIndicator.container);

    const createCoordinatorCallbacks = () => ({
      updateHpBars: () => {
        if (this.combatSession && this.combatHpBars) {
          this.combatSession.preset.sheets.forEach((sheet, idx) => {
            const bar = this.combatHpBars?.[idx];
            const life = getCombatSessionLife(this.combatSession!, sheet.participantId);
            if (bar && life) {
              bar.update(life.current, life.maximum);
            }
          });
        }
      },
      updateTurnIndicator: () => {
        if (this.combatSession && this.combatTurnIndicator) {
          const activeSheet = getCombatSessionActiveSheet(this.combatSession);
          const playerSheet = this.combatSession.preset.sheets[0];
          if (activeSheet && playerSheet) {
            const isPlayerTurn = activeSheet.participantId === playerSheet.participantId;
            this.combatTurnIndicator.update(activeSheet.displayName, isPlayerTurn);
          }
        }
      },
      showOutcomeBanner: (status: 'victory' | 'defeat') => {
        const { width, height } = this.scale;
          if (!this.combatOutcomeBanner) {
            this.combatOutcomeBanner = showOutcomeBanner(this, status, width, height);
            this.combatCameraIsolation?.registerUi(this.combatOutcomeBanner.container);
          }
      },
      logToConsole: (msg: string) => {
        this.logToCombatConsole(msg);
      }
    });
    this.motionCoordinator?.setCallbacks(createCoordinatorCallbacks());

    this.logToCombatConsole('[Combat] Reset. Ready!');
    this.updateDebugText('status: combat reset (ready)');
    this.updateLayout(this.scale.width, this.scale.height);
  }

  private updateLayout(width: number, height: number): void {
    const layout = calculateCombatLayout(width, height);
    this.combatCameraIsolation?.resize(width, height);

    if (this.interactionFeedbackText) {
      const feedbackLayout = getInteractionFeedbackLayout(width, height);
      this.interactionFeedbackText
        .setPosition(feedbackLayout.x, feedbackLayout.y)
        .setStyle({
          fixedWidth: feedbackLayout.fixedWidth,
          wordWrap: { width: feedbackLayout.wrapWidth, useAdvancedWrap: true },
        });
    }

    if (this.combatGridLayout) {
      this.combatGridLayout.originX = layout.grid.originX;
      this.combatGridLayout.originY = layout.grid.originY;
      this.combatGridLayout.cellSize = layout.grid.cellSize;
    }

    const hasConsoleTextures = !!(this.textures.exists(VISUAL_ASSET_KEYS.panelTexture) && this.textures.exists(VISUAL_ASSET_KEYS.borderTexture));
    if (hasConsoleTextures) {
      if (this.combatConsoleBgNineSlice) {
        this.combatConsoleBgNineSlice.setPosition(layout.console.x, layout.console.y);
        this.combatConsoleBgNineSlice.setSize(layout.console.width, layout.console.height);
      }
      if (this.combatConsoleBorderNineSlice) {
        this.combatConsoleBorderNineSlice.setPosition(layout.console.x, layout.console.y);
        this.combatConsoleBorderNineSlice.setSize(layout.console.width, layout.console.height);
      }
      this.combatConsolePanel?.setVisible(false);
    } else {
      if (this.combatConsolePanel) {
        this.combatConsolePanel.clear();
        this.combatConsolePanel.fillStyle(0x10141b, 0.96);
        this.combatConsolePanel.fillRect(layout.console.x, layout.console.y, layout.console.width, layout.console.height);
        this.combatConsolePanel.lineStyle(1, 0x3c4c63, 1);
        this.combatConsolePanel.strokeRect(layout.console.x, layout.console.y, layout.console.width, layout.console.height);
      }
    }

    if (this.combatConsoleHistoryText) {
      this.combatConsoleHistoryText
        .setPosition(layout.console.historyX, layout.console.historyY)
        .setStyle({
          wordWrap: {
            width: layout.console.width - 16,
            useAdvancedWrap: true,
          },
        });
    }

    if (this.combatConsolePromptsText) {
      const promptsY = this.combatMenuState === 'attacks' ? layout.console.promptsAttacksY : layout.console.promptsNormalY;
      this.combatConsolePromptsText
        .setPosition(layout.console.promptsX, promptsY)
        .setStyle({
          wordWrap: {
            width: layout.console.width - 16,
            useAdvancedWrap: true,
          },
        });
      this.updatePromptIcons(layout);
    }

    if (this.combatSession && this.combatMenuView && this.combatMenuState === 'attacks') {
      const availability = projectDebugCombatAttackAvailability(this.combatSession, COMBAT_FIXTURE_IDS.player);
      this.combatMenuView.update(availability, layout.console.promptsX, layout.console.promptsAttacksY);
    }

    if (this.combatTurnIndicator) {
      this.combatTurnIndicator.container.setPosition(layout.turnIndicator.x, layout.turnIndicator.y);
    }

    if (this.combatSession && this.combatHpBars) {
      if (this.combatHpBars[0]) {
        this.combatHpBars[0].container.setPosition(layout.hpBars.player.x, layout.hpBars.player.y);
      }
      if (this.combatHpBars[1]) {
        this.combatHpBars[1].container.setPosition(layout.hpBars.opponent.x, layout.hpBars.opponent.y);
      }
    }

    if (this.explorationPlaceholderText) {
      this.explorationPlaceholderText.setPosition(layout.exploration.placeholderText.x, layout.exploration.placeholderText.y);
    }

    if (this.titleText) {
      this.titleText
        .setPosition(width / 2, height < 420 ? 20 : 24)
        .setVisible(this.mode === 'exploration');
    }

    if (this.debugLegendContainer) {
      this.debugLegendContainer.setPosition(
        layout.exploration.legend.x - 16,
        layout.exploration.legend.y - 72
      );
    }

    if (this.debugHudTexts) {
      const isCombat = this.mode === 'combat';
      const hudLayout = isCombat ? layout.hud : layout.exploration.hud;

      repositionAndStyleHudBlock(
        this.debugHudTexts.objective,
        hudLayout.objective.x,
        hudLayout.objective.y,
        hudLayout.objective.width,
        hudLayout.objective.originX,
        hudLayout.fontSize,
        hudLayout.paddingX,
        hudLayout.paddingY,
        hudLayout.lineSpacing
      );
      repositionAndStyleHudBlock(
        this.debugHudTexts.interaction,
        hudLayout.interaction.x,
        hudLayout.interaction.y,
        hudLayout.interaction.width,
        hudLayout.interaction.originX,
        hudLayout.fontSize,
        hudLayout.paddingX,
        hudLayout.paddingY,
        hudLayout.lineSpacing
      );
      repositionAndStyleHudBlock(
        this.debugHudTexts.entity,
        hudLayout.entity.x,
        hudLayout.entity.y,
        hudLayout.entity.width,
        hudLayout.entity.originX,
        hudLayout.fontSize,
        hudLayout.paddingX,
        hudLayout.paddingY,
        hudLayout.lineSpacing
      );
      repositionAndStyleHudBlock(
        this.debugHudTexts.world,
        hudLayout.world.x,
        hudLayout.world.y,
        hudLayout.world.width,
        hudLayout.world.originX,
        hudLayout.fontSize,
        hudLayout.paddingX,
        hudLayout.paddingY,
        hudLayout.lineSpacing
      );
      repositionAndStyleHudBlock(
        this.debugHudTexts.move,
        hudLayout.move.x,
        hudLayout.move.y,
        hudLayout.move.width,
        hudLayout.move.originX,
        hudLayout.fontSize,
        hudLayout.paddingX,
        hudLayout.paddingY,
        hudLayout.lineSpacing
      );
    }
  }

  private handleTogglePresentationMode(): void {
    const nextMode = togglePresentationMode(this.presentationMode);
    this.presentationMode = nextMode;
    setPresentationMode(nextMode);

    this.showToggleAcknowledgement(nextMode);
    this.applyPresentationMode();
  }

  private showToggleAcknowledgement(mode: PresentationMode): void {
    if (this.acknowledgementText) {
      this.acknowledgementText.destroy();
    }
    const { width } = this.scale;
    const textStr = mode === 'debug' ? 'Debug presentation: ON' : 'Debug presentation: OFF';
    this.acknowledgementText = this.add.text(width / 2, 80, textStr, {
      color: mode === 'debug' ? '#f2c14e' : '#65c98c',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      backgroundColor: '#10141b',
      padding: { x: 10, y: 5 },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    this.combatCameraIsolation?.registerUi(this.acknowledgementText);

    this.tweens.add({
      targets: this.acknowledgementText,
      alpha: 0,
      duration: 500,
      delay: 1000,
      onComplete: () => {
        this.acknowledgementText?.destroy();
        this.acknowledgementText = undefined;
      }
    });
  }

  private applyPresentationMode(): void {
    const mode = this.presentationMode;
    const { width, height } = this.scale;
    const layout = calculateCombatLayout(width, height);

    if (this.debugHudTexts) {
      if (this.mode === 'exploration') {
        this.debugHudTexts.objective.setVisible(layout.exploration.hud.objective.visible && isElementVisible('current_objective', mode));
        this.debugHudTexts.interaction.setVisible(mode === 'debug' && layout.exploration.hud.interaction.visible);
        this.debugHudTexts.entity.setVisible(layout.exploration.hud.entity.visible && isElementVisible('raw_entity_state', mode));
        this.debugHudTexts.world.setVisible(layout.exploration.hud.world.visible && isElementVisible('world_state_dump', mode));
        this.debugHudTexts.move.setVisible(layout.exploration.hud.move.visible && isElementVisible('raw_movement_path_status', mode));
      } else {
        this.debugHudTexts.objective.setVisible(layout.hud.objective.visible && isElementVisible('grid_coordinate_diagnostics', mode));
        this.debugHudTexts.interaction.setVisible(layout.hud.interaction.visible && isElementVisible('grid_coordinate_diagnostics', mode));
        this.debugHudTexts.entity.setVisible(layout.hud.entity.visible && isElementVisible('raw_entity_state', mode));
        this.debugHudTexts.world.setVisible(layout.hud.world.visible && isElementVisible('world_state_dump', mode));
        this.debugHudTexts.move.setVisible(layout.hud.move.visible && isElementVisible('raw_movement_path_status', mode));
      }
    }

    if (this.mode === 'exploration') {
      this.debugLegendContainer?.setVisible(isElementVisible('exploration_debug_legend', mode));
      this.explorationPlaceholderText?.setVisible(isElementVisible('placeholder_debug_captions', mode));
    } else {
      this.debugLegendContainer?.setVisible(false);
      this.explorationPlaceholderText?.setVisible(false);
    }

    if (this.debugActorController) {
      this.debugActorController.updateActorLabel();
    }

    if (this.currentInteractionFeedback && this.interactionFeedbackText) {
      this.interactionFeedbackText
        .setText(mode === 'debug'
          ? this.currentInteractionFeedback.debugMessage
          : this.currentInteractionFeedback.playerMessage)
        .setVisible(this.mode === 'exploration');
    }
  }

  private showInteractionFeedback(feedback: InteractionFeedback): void {
    this.clearInteractionFeedback();
    this.currentInteractionFeedback = feedback;
    this.interactionFeedbackText
      ?.setText(this.presentationMode === 'debug' ? feedback.debugMessage : feedback.playerMessage)
      .setVisible(this.mode === 'exploration');
    this.interactionFeedbackTimer = this.time.delayedCall(
      INTERACTION_FEEDBACK_DURATION_MS,
      () => this.clearInteractionFeedback(),
    );
  }

  private clearInteractionFeedback(): void {
    this.interactionFeedbackTimer?.remove(false);
    this.interactionFeedbackTimer = undefined;
    this.currentInteractionFeedback = undefined;
    this.interactionFeedbackText?.setVisible(false).setText('');
  }

  private activateCombatCameraIsolation(width: number, height: number): void {
    this.deactivateCombatCameraIsolation();
    const isolation = new CombatCameraIsolation(this, width, height);
    this.combatCameraIsolation = isolation;
    isolation.registerUi(
      this.titleText,
      this.interactionFeedbackText,
      this.explorationPlaceholderText,
      this.combatConsolePanel,
      this.combatConsoleBgNineSlice,
      this.combatConsoleBorderNineSlice,
      this.attackIconSprite,
      this.endTurnIconSprite,
      this.moveIconSprite,
      this.combatConsoleHistoryText,
      this.combatConsolePromptsText,
      this.combatMenuView?.container,
      this.combatTurnIndicator?.container,
      this.combatOutcomeBanner?.container,
      this.acknowledgementText,
      ...Object.values(this.debugHudTexts ?? {}),
      ...(this.combatHpBars?.map((bar) => bar.container) ?? []),
    );
    isolation.sync(this.children.list);
  }

  private deactivateCombatCameraIsolation(): void {
    this.combatCameraIsolation?.destroy(this.children.list);
    this.combatCameraIsolation = undefined;
  }

  private rebuildCombatHpBars(width: number, height: number): void {
    if (!this.combatSession) return;

    if (this.combatHpBars) {
      this.combatHpBars.forEach(bar => bar.destroy());
      this.combatHpBars = undefined;
    }

    const playerSheet = this.combatSession.preset.sheets[0];
    const opponentSheet = this.combatSession.preset.sheets[1];
    if (!playerSheet || !opponentSheet) return;

    const playerLife = getCombatSessionLife(this.combatSession, playerSheet.participantId);
    const opponentLife = getCombatSessionLife(this.combatSession, opponentSheet.participantId);
    const layout = calculateCombatLayout(width, height);

    this.combatHpBars = [
      createCombatHpBar(this, {
        x: layout.hpBars.player.x,
        y: layout.hpBars.player.y,
        width: layout.hpBars.player.width,
        height: layout.hpBars.player.height,
        current: playerLife?.current ?? 0,
        maximum: playerLife?.maximum ?? 0,
        label: playerSheet.displayName,
        isPlayer: true,
      }),
      createCombatHpBar(this, {
        x: layout.hpBars.opponent.x,
        y: layout.hpBars.opponent.y,
        width: layout.hpBars.opponent.width,
        height: layout.hpBars.opponent.height,
        current: opponentLife?.current ?? 0,
        maximum: opponentLife?.maximum ?? 0,
        label: opponentSheet.displayName,
        isPlayer: false,
      }),
    ];
    this.combatCameraIsolation?.registerUi(...this.combatHpBars.map((bar) => bar.container));
  }

  private updatePromptIcons(layout: any): void {
    this.attackIconSprite?.setVisible(false);
    this.endTurnIconSprite?.setVisible(false);
    this.moveIconSprite?.setVisible(false);

    if (this.mode !== 'combat' || !this.combatSession) return;

    const promptsY = layout.console.promptsNormalY;
    const centerY = promptsY + 6; // Center vertically on 11px font

    const placements = getCombatPromptIconPlacements(
      this.combatMenuState,
      this.combatSession.encounter.activeTurn.mainActionAvailable,
    );
    const sprites: Partial<Record<string, Phaser.GameObjects.Sprite | undefined>> = {
      [VISUAL_ASSET_KEYS.attackIcon]: this.attackIconSprite,
      [VISUAL_ASSET_KEYS.endTurnIcon]: this.endTurnIconSprite,
      [VISUAL_ASSET_KEYS.moveIcon]: this.moveIconSprite,
    };

    for (const placement of placements) {
      sprites[placement.key]
        ?.setVisible(true)
        .setPosition(layout.console.promptsX + placement.offsetX, centerY)
        .setScale(0.5);
    }
  }
}

