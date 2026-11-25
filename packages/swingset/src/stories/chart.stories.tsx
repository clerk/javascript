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

/** Active agents per day over 30 days. */
const days = [
  23, 25, 24, 22, 9, 8, 26, 30, 32, 29, 27, 11, 10, 36, 39, 40, 38, 35, 15, 13, 43, 46, 48, 45, 42, 17, 16, 50, 53, 23,
].map((agents, i) => ({ day: new Date(Date.UTC(2026, 9, 27 + i)).toISOString().slice(0, 10), agents }));

type DayRow = (typeof days)[number];

const agents = [{ key: 'agents', label: 'Active agents', value: (row: DayRow) => row.agents }];

const getDay = (row: DayRow) => row.day;

export function Default() {
  const chart = Chart.useBarChart({ data: days, series: agents, index: getDay });
  return (
    <Chart.Root
      chart={chart}
      height={320}
      aria-label='Active agents by day'
      className='w-full'
    >
      <Chart.Bars>
        <Chart.Bar />
        <Chart.YLine value={0} />
      </Chart.Bars>
      <Chart.XAxis ticks='calendar'>
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
        <Chart.Tooltip<ActiveBar<DayRow>>>
          {({ datum }) => (
            <Chart.TooltipPortal>
              <Chart.TooltipPositioner>
                <Chart.TooltipPopup>
                  {datum.day}: {datum.agents} active agents
                </Chart.TooltipPopup>
              </Chart.TooltipPositioner>
            </Chart.TooltipPortal>
          )}
        </Chart.Tooltip>
      </Chart.Selection>
    </Chart.Root>
  );
}

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
    // Churn is known only once the week ends, so the week in progress has none.
    retainedChurned: null,
    reactivatedChurned: null,
    newChurned: null,
  },
];

type GrowthRow = (typeof growth)[number];

const growthSeries = [
  { key: 'retained', label: 'Retained', value: (row: GrowthRow) => row.retained },
  { key: 'reactivated', label: 'Reactivated', value: (row: GrowthRow) => row.reactivated },
  { key: 'new', label: 'New', value: (row: GrowthRow) => row.new },
  { key: 'retainedChurned', label: 'Retained churned', value: (row: GrowthRow) => row.retainedChurned },
  { key: 'reactivatedChurned', label: 'Reactivated churned', value: (row: GrowthRow) => row.reactivatedChurned },
  { key: 'newChurned', label: 'New churned', value: (row: GrowthRow) => row.newChurned },
];

const getWeek = (row: GrowthRow) => row.week;

export function Stacked() {
  const chart = Chart.useBarChart({ data: growth, series: growthSeries, index: getWeek });
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
      <Chart.Bars>
        <Chart.Bar />
        <Chart.YLine value={0} />
      </Chart.Bars>
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
            <Chart.TooltipPortal>
              <Chart.TooltipPositioner>
                <Chart.TooltipPopup>
                  <p>{datum.week}</p>
                  {growthSeries.map(s => (
                    <p key={s.key}>
                      {s.label}: {s.value(datum)}
                    </p>
                  ))}
                </Chart.TooltipPopup>
              </Chart.TooltipPositioner>
            </Chart.TooltipPortal>
          )}
        </Chart.Tooltip>
      </Chart.Selection>
    </Chart.Root>
  );
}
