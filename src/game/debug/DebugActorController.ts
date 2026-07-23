import Phaser from 'phaser';
import type { ExplorationMap } from '../../exploration/explorationMap';
import {
  type InterestPoint,
  interactWithInterestPoint,
  type InterestPointInteractionResult,
} from '../../exploration/interestPoint';
import {
  relocateExplorableEntity,
  type ExplorableEntity,
} from '../../exploration/explorableEntity';
import {
  completeActorMove,
  createActorState,
  startActorMove,
  type ActorState,
} from '../../movement/actorState';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { getInteractionStatus } from '../../rules/interactionAvailability';
import { getLocalObjectiveSummary } from '../../rules/localObjective';
import {
  drawExplorationActor,
  playExplorationActorAnimation,
  setExplorationActorPosition,
  type ExplorationActorView,
} from '../visual/drawExplorationActor';
import {
  drawExplorationInterestPoints,
  createExplorationInterestPointsView,
  type ExplorationInterestPointsView,
} from '../visual/drawExplorationInterestPoints';
import {
  drawExplorationPathPreview,
  clearExplorationPathPreview,
} from '../visual/drawExplorationOverlays';
import {
  createDebugExplorationMap,
  DEBUG_ACTOR_MOVE_RANGE,
  DEBUG_EXIT_MARKER_REQUIREMENTS,
  DEBUG_EXPLORATION_GRID,
} from './debugExplorationConfig';
import type { DebugHudSections } from './debugHud';
import {
  drawExplorationMoveDestinations,
  drawExplorationSelectedCell,
  drawExplorationTargetCell,
  clearExplorationSelectedCell,
} from '../visual/drawExplorationOverlays';

const DEBUG_ACTOR_INTERPOLATION_DURATION_MS = 500;
const DEBUG_STATUS_NONE = 'status: none';

export type DebugMoveStartResult =
  | { accepted: true; targetCell: GridCell }
  | { accepted: false; reason: 'actor_moving'; targetCell: GridCell };

export type DebugInteractionResult =
  | { interacted: false; reason: 'actor_moving' | 'none_available' }
  | { interacted: false; reason: 'locked'; point: InterestPoint }
  | { interacted: true; result: InterestPointInteractionResult };

type DebugActorControllerOptions = {
  onStateChanged?: () => void;
  onMapChanged?: (map: ExplorationMap) => void;
};

export class DebugActorController {
  private readonly scene: Phaser.Scene;

  private readonly selectedCellGraphics: Phaser.GameObjects.Graphics;

  private readonly targetCellGraphics: Phaser.GameObjects.Graphics;

  private readonly moveDestinationGraphics: Phaser.GameObjects.Graphics;

  private readonly pathPreviewGraphics: Phaser.GameObjects.Graphics;

  private interestPointView: ExplorationInterestPointsView;

  private readonly onStateChanged?: () => void;

  private readonly onMapChanged?: (map: ExplorationMap) => void;

  private actorView: ExplorationActorView;

  private actorState: ActorState;

  private entity: ExplorableEntity;

  private interestPoints: InterestPoint[];

  private explorationMap: ExplorationMap;

  private activeMoveTween?: Phaser.Tweens.Tween;

  private activePath: GridCell[] = [];

  constructor(
    scene: Phaser.Scene,
    entity: ExplorableEntity,
    interestPoints: readonly InterestPoint[],
    options: DebugActorControllerOptions = {},
  ) {
    this.scene = scene;
    this.onStateChanged = options.onStateChanged;
    this.onMapChanged = options.onMapChanged;
    this.entity = entity;
    this.interestPoints = [...interestPoints];
    this.explorationMap = createDebugExplorationMap(this.interestPoints);
    this.actorState = createActorState(entity.id, entity.cell);
    this.moveDestinationGraphics = this.scene.add.graphics();
    this.drawActorMoveDestinations();
    this.pathPreviewGraphics = this.scene.add.graphics();
    this.interestPointView = createExplorationInterestPointsView(this.scene, this.interestPoints);
    this.drawInterestPoints();
    this.actorView = drawExplorationActor(
      this.scene,
      this.entity.label,
      this.actorState.currentCell,
    );
    this.targetCellGraphics = this.scene.add.graphics();
    this.selectedCellGraphics = this.scene.add.graphics();
  }

  selectCell(cell: GridCell): void {
    drawExplorationSelectedCell(this.selectedCellGraphics, cell);
  }

  drawPathPreview(path: readonly GridCell[]): void {
    drawExplorationPathPreview(this.pathPreviewGraphics, path);
  }

  clearPathPreview(): void {
    clearExplorationPathPreview(this.pathPreviewGraphics);
  }

  setVisible(visible: boolean): void {
    this.moveDestinationGraphics.setVisible(visible);
    this.pathPreviewGraphics.setVisible(visible);
    this.interestPointView.setVisible(visible);
    this.targetCellGraphics.setVisible(visible);
    this.selectedCellGraphics.setVisible(visible);
    this.actorView.graphics.setVisible(visible);
    this.actorView.label.setVisible(visible);
  }

  isMoving(): boolean {
    return this.actorState.status === 'moving';
  }

  getCurrentCell(): GridCell {
    return this.actorState.currentCell;
  }

  getExplorationMap(): ExplorationMap {
    return this.explorationMap;
  }

  startMoveAlongPath(path: readonly GridCell[]): DebugMoveStartResult {
    const targetCell = path.length > 0
      ? path[path.length - 1]
      : this.actorState.currentCell;

    this.selectCell(targetCell);

    if (this.actorState.status === 'moving') {
      this.drawActorTargetCell();

      return {
        accepted: false,
        reason: 'actor_moving',
        targetCell: this.actorState.targetCell,
      };
    }

    if (path.length === 0) {
      this.activePath = [];
      this.drawActorTargetCell();

      return {
        accepted: true,
        targetCell,
      };
    }

    this.activePath = [...path];
    this.actorState = startActorMove(this.actorState, targetCell);

    if (this.actorState.status === 'moving') {
      this.startVisualMoveAlongPath(this.activePath);
    }

    this.drawActorTargetCell();

    return {
      accepted: true,
      targetCell,
    };
  }

  completeMove(): boolean {
    return this.completeCurrentMove({ stopTween: true });
  }

  tryInteract(): DebugInteractionResult {
    if (this.actorState.status === 'moving') {
      return {
        interacted: false,
        reason: 'actor_moving',
      };
    }

    const status = getInteractionStatus(
      this.actorState.currentCell,
      this.interestPoints,
      DEBUG_EXIT_MARKER_REQUIREMENTS,
    );

    if (status.status === 'locked') {
      return {
        interacted: false,
        reason: 'locked',
        point: status.point,
      };
    }

    if (status.status !== 'available') {
      return {
        interacted: false,
        reason: 'none_available',
      };
    }

    const interactionResult = interactWithInterestPoint(status.point);

    this.interestPoints = this.interestPoints.map((point) =>
      point.id === status.point.id ? interactionResult.point : point);
    this.drawInterestPoints();

    if (interactionResult.effect.type === 'switch_toggled') {
      this.refreshExplorationMap();
    }

    return {
      interacted: true,
      result: interactionResult,
    };
  }

  clearSelectedCell(): void {
    clearExplorationSelectedCell(this.selectedCellGraphics);
    this.clearPathPreview();
  }

  updateActorLabel(): void {
    setExplorationActorPosition(
      this.actorView,
      this.entity.label,
      this.actorState.currentCell,
    );
  }

  buildDebugHudSections(selectionText: string): DebugHudSections {
    const targetText = this.actorState.status === 'moving'
      ? `target cell: ${this.formatCell(this.actorState.targetCell)}`
      : 'target cell: none';
    const pathText = this.actorState.status === 'moving'
      ? `path steps: ${this.activePath.length}`
      : 'path steps: 0';

    return {
      objective: [
        'objective',
        this.formatObjectiveText(),
      ].join('\n'),
      interaction: [
        'interaction',
        this.formatInteractionText(),
      ].join('\n'),
      entity: [
        'entity',
        `actor: ${this.entity.label}`,
        `status: ${this.actorState.status}`,
        `entityCell: ${this.formatCell(this.entity.cell)}`,
        `currentCell: ${this.formatCell(this.actorState.currentCell)}`,
      ].join('\n'),
      world: [
        'world',
        this.formatSwitchStateText(),
      ].join('\n'),
      move: [
        'move',
        selectionText,
        targetText,
        pathText,
      ].join('\n'),
    };
  }

  private completeCurrentMove({ stopTween }: { stopTween: boolean }): boolean {
    const wasMoving = this.actorState.status === 'moving';

    this.actorState = completeActorMove(this.actorState);

    if (wasMoving) {
      if (stopTween) {
        this.stopVisualMove();
      }

      this.activePath = [];
      this.entity = relocateExplorableEntity(this.entity, this.actorState.currentCell);
      setExplorationActorPosition(
        this.actorView,
        this.entity.label,
        this.actorState.currentCell,
      );
      playExplorationActorAnimation(this.scene, this.actorView, 'idle');
      this.clearTargetCell();
      this.clearPathPreview();
      this.drawActorMoveDestinations();
    }

    return wasMoving;
  }

  private clearTargetCell(): void {
    clearExplorationSelectedCell(this.targetCellGraphics);
  }

  private drawActorMoveDestinations(): void {
    drawExplorationMoveDestinations(
      this.moveDestinationGraphics,
      this.explorationMap,
      this.actorState.currentCell,
      DEBUG_ACTOR_MOVE_RANGE,
    );
  }

  private drawActorTargetCell(): void {
    if (this.actorState.status === 'moving') {
      drawExplorationTargetCell(this.targetCellGraphics, this.actorState.targetCell);
      return;
    }

    this.clearTargetCell();
  }

  private drawInterestPoints(): void {
    drawExplorationInterestPoints(this.interestPointView, this.interestPoints);
  }

  private refreshExplorationMap(): void {
    this.explorationMap = createDebugExplorationMap(this.interestPoints);
    this.clearPathPreview();
    this.drawActorMoveDestinations();
    this.onMapChanged?.(this.explorationMap);
  }

  private formatObjectiveText(): string {
    return getLocalObjectiveSummary(
      this.interestPoints,
      DEBUG_EXIT_MARKER_REQUIREMENTS,
    ).text;
  }

  private formatInteractionText(): string {
    if (this.actorState.status === 'moving') {
      return DEBUG_STATUS_NONE;
    }

    const status = getInteractionStatus(
      this.actorState.currentCell,
      this.interestPoints,
      DEBUG_EXIT_MARKER_REQUIREMENTS,
    );

    switch (status.status) {
      case 'available':
        return `status: available (${this.formatInteractionPoint(status.point)})`;
      case 'locked':
        return `status: locked (${this.formatInteractionPoint(status.point)})`;
      case 'inspected':
        return `status: resolved (${this.formatInteractionPoint(status.point)})`;
      case 'none':
        return DEBUG_STATUS_NONE;
    }
  }

  private formatSwitchStateText(): string {
    const switchStates = this.interestPoints
      .filter((point) => point.kind === 'switch')
      .map((point) => `${point.label}=${point.debugFlagActive ? 'on' : 'off'}`);

    return switchStates.length > 0
      ? `switches: ${switchStates.join(', ')}`
      : 'switches: none';
  }

  private startVisualMoveAlongPath(path: readonly GridCell[]): void {
    this.stopVisualMove();
    setExplorationActorPosition(
      this.actorView,
      this.entity.label,
      this.actorState.currentCell,
    );
    playExplorationActorAnimation(this.scene, this.actorView, 'movement');

    const segmentDuration = DEBUG_ACTOR_INTERPOLATION_DURATION_MS / path.length;
    this.startPathSegment(path, 0, segmentDuration);
  }

  private startPathSegment(
    path: readonly GridCell[],
    segmentIndex: number,
    segmentDuration: number,
  ): void {
    const targetCell = path[segmentIndex];
    const targetPosition = this.getActorWorldPosition(targetCell);
    const tweenPosition = {
      x: this.actorView.graphics.x,
      y: this.actorView.graphics.y,
    };

    this.activeMoveTween = this.scene.tweens.add({
      targets: tweenPosition,
      x: targetPosition.x,
      y: targetPosition.y,
      duration: segmentDuration,
      ease: 'Linear',
      onUpdate: () => {
        this.setVisualPosition(tweenPosition.x, tweenPosition.y);
      },
      onComplete: () => {
        this.activeMoveTween = undefined;
        this.setVisualPosition(targetPosition.x, targetPosition.y);

        if (segmentIndex < path.length - 1) {
          this.startPathSegment(path, segmentIndex + 1, segmentDuration);
          return;
        }

        const completedMove = this.completeCurrentMove({ stopTween: false });

        if (completedMove) {
          this.onStateChanged?.();
        }
      },
    });
  }

  private stopVisualMove(): void {
    this.activeMoveTween?.stop();
    this.activeMoveTween = undefined;
    playExplorationActorAnimation(this.scene, this.actorView, 'idle');
  }

  private setVisualPosition(x: number, y: number): void {
    const actorRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.28;

    this.actorView.graphics.setPosition(x, y);
    this.actorView.label.setPosition(x, y + actorRadius + 5);
  }

  private getActorWorldPosition(cell: GridCell): { x: number; y: number } {
    const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);

    return {
      x: DEBUG_EXPLORATION_GRID.originX + cellCenter.x,
      y: DEBUG_EXPLORATION_GRID.originY + cellCenter.y,
    };
  }

  private formatCell(cell: GridCell): string {
    return `${cell.x},${cell.y}`;
  }

  private formatInteractionPoint(point: InterestPoint): string {
    return `${this.formatInterestPointKind(point.kind)}: ${point.label}`;
  }

  private formatInterestPointKind(pointKind: InterestPoint['kind']): string {
    switch (pointKind) {
      case 'survey':
        return 'survey';
      case 'switch':
        return 'switch';
      case 'exit_marker':
        return 'exit marker';
      case 'combat_trigger':
        return 'combat trigger';
    }
  }
}
