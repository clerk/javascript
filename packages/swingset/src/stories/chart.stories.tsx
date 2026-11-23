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

/** Weekly active users, as Dashboard's overview reports them. */
const growth = [
  {
    week: '2026-01-05',
    retained: 120,
    reactivated: 18,
    new: 34,
    retainedChurned: -22,
    reactivatedChurned: -9,
    newChurned: -15,
  },
  {
    week: '2026-01-12',
    retained: 128,
    reactivated: 22,
    new: 41,
    retainedChurned: -25,
    reactivatedChurned: -11,
    newChurned: -18,
  },
  {
    week: '2026-01-19',
    retained: 131,
    reactivated: 19,
    new: 38,
    retainedChurned: -24,
    reactivatedChurned: -12,
    newChurned: -16,
  },
  {
    week: '2026-01-26',
    retained: 137,
    reactivated: 25,
    new: 46,
    retainedChurned: -27,
    reactivatedChurned: -10,
    newChurned: -20,
  },
  {
    week: '2026-02-02',
    retained: 142,
    reactivated: 21,
    new: 43,
    retainedChurned: -29,
    reactivatedChurned: -13,
    newChurned: -19,
  },
  {
    week: '2026-02-09',
    retained: 150,
    reactivated: 27,
    new: 52,
    retainedChurned: -28,
    reactivatedChurned: -12,
    newChurned: -22,
  },
  {
    week: '2026-02-16',
    retained: 155,
    reactivated: 24,
    new: 49,
    retainedChurned: -31,
    reactivatedChurned: -14,
    newChurned: -21,
  },
  {
    week: '2026-02-23',
    retained: 158,
    reactivated: 14,
    new: 27,
    retainedChurned: -12,
    reactivatedChurned: -6,
    newChurned: -9,
  },
];

type GrowthRow = (typeof growth)[number];

const series = [
  { key: 'retained', value: (row: GrowthRow) => row.retained },
  { key: 'reactivated', value: (row: GrowthRow) => row.reactivated },
  { key: 'new', value: (row: GrowthRow) => row.new },
  { key: 'retainedChurned', value: (row: GrowthRow) => row.retainedChurned },
  { key: 'reactivatedChurned', value: (row: GrowthRow) => row.reactivatedChurned },
  { key: 'newChurned', value: (row: GrowthRow) => row.newChurned },
];

const getWeek = (row: GrowthRow) => row.week;

export function Default() {
  const chart = Chart.useBarChart({ data: growth, series, index: getWeek });
  return (
    <Chart.Root
      chart={chart}
      height={320}
      aria-label='Weekly active users'
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
