export interface EconomyState {
  gold: number;
  lives: number;
}

export function createEconomy(startingGold: number, startingLives: number): EconomyState {
  return { gold: startingGold, lives: startingLives };
}

export function canAfford(state: EconomyState, cost: number): boolean {
  return state.gold >= cost;
}

export function spend(state: EconomyState, cost: number): EconomyState {
  if (!canAfford(state, cost)) {
    throw new Error(`Cannot spend ${cost} gold with only ${state.gold} available`);
  }
  return { ...state, gold: state.gold - cost };
}

export function earn(state: EconomyState, amount: number): EconomyState {
  return { ...state, gold: state.gold + amount };
}

export function loseLife(state: EconomyState, amount = 1): EconomyState {
  return { ...state, lives: Math.max(0, state.lives - amount) };
}

export function isGameOver(state: EconomyState): boolean {
  return state.lives <= 0;
}
