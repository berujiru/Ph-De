import type { Enemy } from '../entities/Enemy';

export interface EnemyAIConfig {
  skillCooldownMs?: number;
  initialSkillDelayMs?: number;
  castCondition?: 'always' | 'halfHp';
}

export class EnemyAI {
  private enemy: Enemy;
  private config: EnemyAIConfig;
  private skillTimer: number = 0;
  private hasCastHalfHp: boolean = false;

  constructor(enemy: Enemy, config: EnemyAIConfig) {
    this.enemy = enemy;
    this.config = config;
    this.skillTimer = config.initialSkillDelayMs ?? config.skillCooldownMs ?? 0;
  }

  update(delta: number) {
    if (this.enemy.isDead || !this.enemy.definition.activeSkill) return;

    let shouldCast = false;
    const condition = this.config.castCondition ?? 'always';

    if (condition === 'halfHp') {
      if (!this.hasCastHalfHp && this.enemy.hp <= this.enemy.definition.maxHp / 2) {
        shouldCast = true;
        this.hasCastHalfHp = true;
      }
    } else if (condition === 'always') {
      // Cooldown based
      if (this.config.skillCooldownMs && this.config.skillCooldownMs > 0) {
        this.skillTimer -= delta;
        if (this.skillTimer <= 0) {
          shouldCast = true;
          this.skillTimer = this.config.skillCooldownMs;
        }
      }
    }

    if (shouldCast) {
      this.enemy.triggerSkill();
    }
  }
}
