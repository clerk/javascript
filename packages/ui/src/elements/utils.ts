// This function evenly distributes the strategies into rows (the inner arrays).
// This is done by calculating the number of necessary rows, then the amount of strategies in each row, and then distributing the strategies into the rows.
// If lastAuthenticationStrategy is provided and exists in strategies, it will be separated onto its own row.
// Example of 5 strategies with max 3 per row: [ [1, 2, 3], [4, 5] ]
// Example with lastAuthenticationStrategy: [ [lastAuth], [1, 2, 3], [4] ]

export function distributeStrategiesIntoRows<T>(
  strategies: T[],
  maxStrategiesPerRow: number,
  lastAuthenticationStrategy: T | null | undefined,
): {
  strategyRows: T[][];
  lastAuthenticationStrategyPresent: boolean;
} {
  // If lastAuthenticationStrategy exists and is in the strategies array, separate it
  if (lastAuthenticationStrategy && strategies.includes(lastAuthenticationStrategy)) {
    const remainingStrategies = strategies.filter(strategy => strategy !== lastAuthenticationStrategy);

    // If no remaining strategies, just return the last auth strategy in its own row
    if (remainingStrategies.length === 0) {
      return { strategyRows: [[lastAuthenticationStrategy]], lastAuthenticationStrategyPresent: true };
    }

    // Distribute remaining strategies normally
    const remainingRows = distributeStrategiesIntoRows(remainingStrategies, maxStrategiesPerRow, null);

    // Return with lastAuthenticationStrategy in its own row at the beginning
    return {
      strategyRows: [[lastAuthenticationStrategy], ...remainingRows.strategyRows],
      lastAuthenticationStrategyPresent: true,
    };
  }

  // Original logic for when lastAuthenticationStrategy is not applicable
  if (strategies.length <= maxStrategiesPerRow) {
    return { strategyRows: [strategies], lastAuthenticationStrategyPresent: false };
  }

  const numRows = Math.ceil(strategies.length / maxStrategiesPerRow);
  const strategiesPerRow = Math.ceil(strategies.length / numRows);
  const strategyRows: T[][] = Array.from({ length: numRows }, () => []);

  let currentArrayIndex = 0;

  for (const strategy of strategies) {
    strategyRows[currentArrayIndex].push(strategy);

    if (strategyRows[currentArrayIndex].length === strategiesPerRow) {
      currentArrayIndex++;
    }
  }

  return { strategyRows, lastAuthenticationStrategyPresent: false };
}
