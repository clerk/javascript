// This function evenly distributes the strategies into rows (the inner arrays).
// This is done by calculating the number of necessary rows, then the amount of strategies in each row, and then distributing the strategies into the rows.
// Example of 5 strategies with max 3 per row: [ [1, 2, 3], [4, 5] ]
export function distributeStrategiesIntoRows<T>(strategies: T[], maxStrategiesPerRow: number): T[][] {
  if (strategies.length <= maxStrategiesPerRow) {
    return [strategies];
  }

  const numRows = Math.ceil(strategies.length / maxStrategiesPerRow);
  const strategiesPerRow = Math.ceil(strategies.length / numRows);
  const rows: T[][] = Array.from({ length: numRows }, () => []);

  let currentArrayIndex = 0;

  for (const strategy of strategies) {
    rows[currentArrayIndex].push(strategy);

    if (rows[currentArrayIndex].length === strategiesPerRow) {
      currentArrayIndex++;
    }
  }

  return rows;
}
