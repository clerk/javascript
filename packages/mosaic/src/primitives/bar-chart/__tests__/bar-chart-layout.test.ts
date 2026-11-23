import { describe, expect, it } from 'vitest';

import { DEFAULT_CHART_MARGIN, prepareStackedBars, projectStackedBars } from '../bar-chart-layout';
import type { BarProjection } from '../types';

interface TypedRow {
  start: string;
  gained: number;
  lost: number;
}

describe('typed rows', () => {
  it('reads interface rows through series accessors and keeps each original row', () => {
    const rows: TypedRow[] = [
      { start: 'Jan', gained: 4, lost: -2 },
      { start: 'Feb', gained: 0, lost: -1 },
    ];
    const prepared = prepareStackedBars({
      data: rows,
      series: [
        { key: 'up', value: row => row.gained * 2 },
        { key: 'down', value: row => row.lost },
      ],
      index: row => row.start,
    });

    expect(prepared.points.map(point => [point.seriesKey, point.value])).toEqual([
      ['up', 8],
      ['down', -2],
      ['down', -1],
    ]);
    expect(prepared.points[0].datum).toBe(rows[0]);
    expect(prepared.domain).toEqual([-2, 8]);
  });
});

describe('projection acceptance', () => {
  it.each<{ projection: BarProjection; projected: boolean }>([
    { projection: { datumIndex: 0, value: 20 }, projected: true },
    { projection: { datumIndex: 0, value: 10.5 }, projected: true },
    { projection: { datumIndex: 99, value: 10000 }, projected: false },
    { projection: { datumIndex: -1, value: 10000 }, projected: false },
    { projection: { datumIndex: 0.5, value: 10000 }, projected: false },
    { projection: { datumIndex: NaN, value: 10000 }, projected: false },
    { projection: { datumIndex: 0, value: 5 }, projected: false },
    { projection: { datumIndex: 0, value: 10 }, projected: false },
    { projection: { datumIndex: 0, value: NaN }, projected: false },
    { projection: { datumIndex: 0, value: Infinity }, projected: false },
  ])(
    'draws projection $projection.datumIndex/$projection.value over a bar of 10: $projected',
    ({ projection, projected }) => {
      const prepared = prepareStackedBars({
        data: [{ period: 'Jan', value: 10 }],
        series: [{ key: 'value', value: row => row.value }],
        index: row => row.period,
      });
      const result = projectStackedBars(prepared, {
        size: { width: 400, height: 300 },
        margin: DEFAULT_CHART_MARGIN,
        categoryGap: 0.25,
        projection,
      });

      expect(result.projection !== null).toBe(projected);
      expect(result.categories[0]?.projected).toBe(projected);
      if (projected) {
        expect(result.yTicks.at(-1)?.value).toBeGreaterThanOrEqual(projection.value);
      }
    },
  );

  it('makes a projection-only category selectable in its positive section', () => {
    const prepared = prepareStackedBars({
      data: [{ period: 'Mar', value: 0 }],
      series: [{ key: 'value', value: row => row.value }],
      index: row => row.period,
    });
    const [category] = projectStackedBars(prepared, {
      size: { width: 400, height: 300 },
      margin: DEFAULT_CHART_MARGIN,
      categoryGap: 0.25,
      projection: { datumIndex: 0, value: 20 },
    }).categories;

    expect(category).toMatchObject({
      projected: true,
      sections: { positive: true, negative: false },
      hasValues: { positive: false, negative: false },
    });
  });
});
