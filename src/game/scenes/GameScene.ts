import Phaser from 'phaser';
import { PATH_WAYPOINTS, BUILD_SLOTS } from '../data/level';
import {
  TOWER_DEFINITIONS,
  ENEMY_DEFINITIONS,
  WAVES,
  STARTING_GOLD,
  STARTING_LIVES,
  type EnemyId,
  type TowerId,
} from '../data/balance';
import { Enemy } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { WaveManager } from '../core/WaveManager';
import {
  createEconomy,
  canAfford,
  spend,
  earn,
  loseLife,
  isGameOver,
  type EconomyState,
} from '../core/Economy';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot } from '../core/GameEvents';

export class GameScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];
  private readonly waveManager = new WaveManager(WAVES);
  private economy: EconomyState = createEconomy(STARTING_GOLD, STARTING_LIVES);
  private selectedTowerId: TowerId | null = null;
  private status: GameStateSnapshot['status'] = 'playing';
  private lastSnapshot = '';
  private unsubscribers: Array<() => void> = [];

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.drawPath();
    this.drawBuildSlots();
    this.bindUiEvents();
    this.emitState(true);
  }

  update(_time: number, delta: number): void {
    if (this.status !== 'playing') return;

    for (const spawnEvent of this.waveManager.update(delta)) {
      this.spawnEnemy(spawnEvent.enemyId as EnemyId);
    }

    for (const enemy of this.enemies) {
      enemy.update(delta);
      if (enemy.reachedEnd) {
        this.economy = loseLife(this.economy, 1);
      }
    }
    this.enemies = this.enemies.filter((enemy) => {
      const gone = enemy.isDead || enemy.reachedEnd;
      if (gone) enemy.destroy();
      return !gone;
    });

    for (const tower of this.towers) tower.update(delta, this.enemies);

    this.projectiles = this.projectiles.filter((projectile) => !projectile.update(delta));

    this.updateStatus();
    this.emitState();
  }

  private updateStatus(): void {
    if (isGameOver(this.economy)) {
      this.status = 'lost';
      return;
    }
    const allWavesDone =
      this.waveManager.currentWaveNumber > 0 &&
      !this.waveManager.hasMoreWaves() &&
      !this.waveManager.isWaveActive;
    if (allWavesDone && this.enemies.length === 0) {
      this.status = 'won';
    }
  }

  private drawPath(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(28, 0x334155, 1);
    graphics.beginPath();
    graphics.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y);
    for (const point of PATH_WAYPOINTS.slice(1)) graphics.lineTo(point.x, point.y);
    graphics.strokePath();
  }

  private drawBuildSlots(): void {
    for (const slot of BUILD_SLOTS) {
      const zone = this.add
        .rectangle(slot.x, slot.y, 40, 40, 0x1e293b, 0.6)
        .setStrokeStyle(1, 0x475569);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.placeTowerAt(slot.id, slot.x, slot.y));
    }
  }

  private bindUiEvents(): void {
    this.unsubscribers.push(
      uiToGameEvents.on('selectTowerType', (id) => {
        this.selectedTowerId = id;
      }),
      uiToGameEvents.on('startWave', () => {
        this.waveManager.startNextWave();
        this.emitState();
      }),
      uiToGameEvents.on('restart', () => this.scene.restart()),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribers.forEach((unsubscribe) => unsubscribe());
      this.unsubscribers = [];
    });
  }

  private placeTowerAt(slotId: string, x: number, y: number): void {
    if (this.status !== 'playing' || !this.selectedTowerId) return;
    if (this.towers.some((tower) => tower.getData('slotId') === slotId)) return;

    const definition = TOWER_DEFINITIONS[this.selectedTowerId];
    if (!canAfford(this.economy, definition.cost)) return;

    this.economy = spend(this.economy, definition.cost);
    const tower = new Tower(this, x, y, definition);
    tower.setData('slotId', slotId);
    tower.onFire = (firingTower, target) => this.fireProjectile(firingTower, target);
    this.towers.push(tower);
    this.emitState();
  }

  private fireProjectile(tower: Tower, target: Enemy): void {
    const projectile = new Projectile(
      this,
      tower.x,
      tower.y,
      target,
      tower.definition.projectileSpeed,
      tower.definition.damage,
      tower.definition.color,
    );
    projectile.onHit = (enemy, damage) => this.damageEnemy(enemy, damage);
    this.projectiles.push(projectile);
  }

  private damageEnemy(enemy: Enemy, damage: number): void {
    enemy.takeDamage(damage);
    if (enemy.isDead) {
      this.economy = earn(this.economy, enemy.definition.reward);
    }
  }

  private spawnEnemy(enemyId: EnemyId): void {
    const definition = ENEMY_DEFINITIONS[enemyId];
    this.enemies.push(new Enemy(this, definition, PATH_WAYPOINTS));
  }

  private emitState(force = false): void {
    const snapshot: GameStateSnapshot = {
      gold: this.economy.gold,
      lives: this.economy.lives,
      waveNumber: this.waveManager.currentWaveNumber,
      totalWaves: this.waveManager.totalWaves,
      waveActive: this.waveManager.isWaveActive,
      status: this.status,
    };
    const serialized = JSON.stringify(snapshot);
    if (!force && serialized === this.lastSnapshot) return;
    this.lastSnapshot = serialized;
    gameToUiEvents.emit('stateChanged', snapshot);
  }
}
