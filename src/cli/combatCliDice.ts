export type CombatCliRandomSource = () => number;

export type CombatCliD20Roller = {
  rollD20: () => number;
};

export function createCombatCliDice(
  randomSource: CombatCliRandomSource = Math.random,
): CombatCliD20Roller {
  return {
    rollD20: () => rollD20(randomSource),
  };
}

export function rollD20(randomSource: CombatCliRandomSource = Math.random): number {
  const randomValue = randomSource();
  if (!Number.isFinite(randomValue)) {
    throw new Error('Combat CLI random source must return a finite number.');
  }

  const boundedRandomValue = Math.min(Math.max(randomValue, 0), 0.999_999_999_999);

  return Math.floor(boundedRandomValue * 20) + 1;
}
