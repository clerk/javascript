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

/**
 * Calculates the number of columns given the total number of items and the maximum columns allowed per row.
 *
 * @param {Object} options
 * @param {number} options.length - The total number of items.
 * @param {number} options.max - The maximum number of columns allowed per row.
 * @returns The calculated number of columns.
 *
 * Example output for item counts from 1 to 24 with `columns: 6`:
 *
 *  1:  [ 1 ]
 *  2:  [ 1, 2 ]
 *  3:  [ 1, 2, 3 ]
 *  4:  [ 1, 2, 3, 4 ]
 *  5:  [ 1, 2, 3, 4, 5 ]
 *  6:  [ 1, 2, 3, 4, 5, 6 ]
 *  7:  [ [1, 2, 3, 4], [5, 6, 7] ]
 *  8:  [ [1, 2, 3, 4], [5, 6, 7, 8] ]
 *  9:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9] ]
 * 10:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10] ]
 * 11:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11] ]
 * 12:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12] ]
 * 13:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13] ]
 * 14:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14] ]
 * 15:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15] ]
 * 16:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16] ]
 * 17:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17] ]
 * 18:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18] ]
 * 19:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19] ]
 * 20:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20] ]
 * 21:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21] ]
 * 22:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21, 22] ]
 * 23:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23] ]
 * 24:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24] ]
 *
 * Examples:
 * ```
 * getColumnCount(1); // 1
 * getColumnCount(7); // 4
 * getColumnCount(15); // 6
 * ```
 */
export function getColumnCount(length: number, max: number): number {
  const numRows = Math.ceil(length / max);
  return Math.ceil(length / numRows);
}
