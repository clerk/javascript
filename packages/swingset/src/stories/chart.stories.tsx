'use client';

import { type ActiveBar, Chart } from '@clerk/mosaic/primitives/chart';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'wip',
  title: 'Chart',
  label: 'Chart',
  source: 'packages/mosaic/src/primitives/chart/index.ts',
};

const growth = [
  { week: '2026-01-05', signups: 40, returning: 22, churned: -14 },
  { week: '2026-01-12', signups: 52, returning: 30, churned: -18 },
  { week: '2026-01-19', signups: 36, returning: 26, churned: -22 },
  { week: '2026-01-26', signups: 61, returning: 34, churned: -12 },
  { week: '2026-02-02', signups: 48, returning: 29, churned: -25 },
  { week: '2026-02-09', signups: 55, returning: 41, churned: -17 },
];

type GrowthRow = (typeof growth)[number];

const series = [
  { key: 'signups', value: (row: GrowthRow) => row.signups },
  { key: 'returning', value: (row: GrowthRow) => row.returning },
  { key: 'churned', value: (row: GrowthRow) => row.churned },
];

const getWeek = (row: GrowthRow) => row.week;

export function Default() {
  const chart = Chart.useBarChart({ data: growth, series, index: getWeek });
  return (
    <Chart.Root
      chart={chart}
      height={320}
      aria-label='Weekly growth'
      className='w-full'
    >
      <Chart.Grid>
        {ticks =>
          ticks.map(tick => (
            <Chart.YLine
              key={tick.value}
              value={tick.value}
            />
          ))
        }
      </Chart.Grid>
      <Chart.StackedBars>
        <Chart.Bar />
        <Chart.YLine value={0} />
      </Chart.StackedBars>
      <Chart.YAxis>
        {ticks =>
          ticks.map(tick => (
            <Chart.YTick
              key={tick.value}
              tick={tick}
            />
          ))
        }
      </Chart.YAxis>
      <Chart.XAxis>
        {ticks =>
          ticks.map(tick => (
            <Chart.XTick
              key={tick.key}
              tick={tick}
            />
          ))
        }
      </Chart.XAxis>
      <Chart.Selection>
        <Chart.Cursor />
        <Chart.Tooltip<ActiveBar<GrowthRow>>>
          {({ datum }) => (
            <>
              <p>{datum.week}</p>
              {series.map(s => (
                <p key={s.key}>
                  {s.key}: {s.value(datum)}
                </p>
              ))}
            </>
          )}
        </Chart.Tooltip>
      </Chart.Selection>
    </Chart.Root>
  );
}
