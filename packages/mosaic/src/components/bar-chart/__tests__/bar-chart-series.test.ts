import { describe, expect, it } from 'vitest';

import type { ActiveBar } from '../../../primitives/chart';
import type { ChartSeries } from '../../chart';
import type { ChartFormat } from '../../chart/internal/use-chart-format';
import { barTooltip } from '../bar-chart-series';

type Row = { week: string; signups: number; returning: number; churned: number };

const week: Row = { week: '2026-01-05', signups: 40, returning: 22, churned: -14 };

const series: ChartSeries<Row>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'returning', label: 'Returning', color: 2, value: row => row.returning },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

describe('the default tooltip', () => {
  const format: ChartFormat = { value: value => `${value}`, category: key => `Week of ${key}` };
  const active = (section: 'positive' | 'negative', projected = false): ActiveBar<Row> => ({
    category: '2026-01-05',
    datumIndex: 0,
    datum: week,
    section,
    projected,
    hasValues: { positive: true, negative: true },
  });

  it('lists the positive section top of the stack first', () => {
    expect(barTooltip({ active: active('positive'), series, projection: undefined, format })).toEqual({
      active: active('positive'),
      heading: 'Week of 2026-01-05',
      metrics: [],
      rows: [
        { key: 'returning', label: 'Returning', color: 2, value: '22' },
        { key: 'signups', label: 'Sign-ups', color: 1, value: '40' },
      ],
    });
  });

  it('lists only the negative series for the negative section', () => {
    expect(barTooltip({ active: active('negative'), series, projection: undefined, format })?.rows).toEqual([
      { key: 'churned', label: 'Churned', color: 3, value: '-14' },
    ]);
  });

  it('adds the projection as a metric only where it is drawn and labelled', () => {
    const projection = { datumIndex: 0, value: 80, label: 'Projected' };

    expect(barTooltip({ active: active('positive', true), series, projection, format })?.metrics).toEqual([
      { label: 'Projected', value: '80' },
    ]);
    expect(barTooltip({ active: active('positive'), series, projection, format })?.metrics).toEqual([]);
    expect(
      barTooltip({ active: active('positive', true), series, projection: { ...projection, label: undefined }, format })
        ?.metrics,
    ).toEqual([]);
  });

  it('hides the tooltip for a period with nothing to show', () => {
    const empty = { ...active('negative'), datum: { ...week, churned: 0 } };

    expect(barTooltip({ active: empty, series, projection: undefined, format })).toBeNull();
  });
});
