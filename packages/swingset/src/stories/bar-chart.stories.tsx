'use client';

import { BarChart } from '@clerk/mosaic/primitives/bar-chart';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'wip',
  title: 'BarChart',
  label: 'Bar Chart',
  source: 'packages/mosaic/src/primitives/bar-chart/index.ts',
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
  const chart = BarChart.useBarChart({ data: growth, series, index: getWeek });
  return (
    <BarChart.Root
      chart={chart}
      height={320}
      aria-label='Weekly growth'
      className='w-full'
    >
      <BarChart.Grid>
        {lines =>
          lines.map(line => (
            <BarChart.GridLine
              key={line.value}
              line={line}
            />
          ))
        }
      </BarChart.Grid>
      <BarChart.StackedBars>
        <BarChart.Bar />
        <BarChart.ZeroLine />
      </BarChart.StackedBars>
      <BarChart.YAxis>
        {ticks =>
          ticks.map(tick => (
            <BarChart.YTick
              key={tick.value}
              tick={tick}
            />
          ))
        }
      </BarChart.YAxis>
      <BarChart.XAxis>
        {ticks =>
          ticks.map(tick => (
            <BarChart.XTick
              key={tick.key}
              tick={tick}
            />
          ))
        }
      </BarChart.XAxis>
      <BarChart.BarSelection>
        <BarChart.Cursor />
        <BarChart.Tooltip<GrowthRow>>
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
        </BarChart.Tooltip>
      </BarChart.BarSelection>
    </BarChart.Root>
  );
}
