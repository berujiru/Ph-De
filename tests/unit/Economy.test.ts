import { describe, expect, it } from 'vitest';
import { canAfford, createEconomy, earn, isGameOver, loseLife, spend } from '../../src/game/core/Economy';

describe('Economy', () => {
  it('creates initial state from starting values', () => {
    const state = createEconomy(150, 20);
    expect(state).toEqual({ gold: 150, lives: 20 });
  });

  it('reports affordability correctly', () => {
    const state = createEconomy(50, 20);
    expect(canAfford(state, 50)).toBe(true);
    expect(canAfford(state, 51)).toBe(false);
  });

  it('spend deducts gold without mutating the original state', () => {
    const state = createEconomy(100, 20);
    const next = spend(state, 40);
    expect(next.gold).toBe(60);
    expect(state.gold).toBe(100);
  });

  it('spend throws when gold is insufficient', () => {
    const state = createEconomy(10, 20);
    expect(() => spend(state, 20)).toThrow();
  });

  it('earn adds gold', () => {
    const state = createEconomy(0, 20);
    expect(earn(state, 25).gold).toBe(25);
  });

  it('loseLife decrements lives and never goes below zero', () => {
    const state = createEconomy(0, 1);
    const next = loseLife(state, 5);
    expect(next.lives).toBe(0);
  });

  it('isGameOver is true once lives reach zero', () => {
    expect(isGameOver(createEconomy(0, 0))).toBe(true);
    expect(isGameOver(createEconomy(0, 1))).toBe(false);
  });
});
