'use client';

import { Button } from '@clerk/mosaic/components/button';
import { type BarSelection, Chart, type ChartSeries } from '@clerk/mosaic/components/chart';
import { useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './chart.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Chart',
  label: 'Chart',
  source: 'packages/mosaic/src/components/chart/index.ts',
};

/** Weekly active users, as Dashboard's overview reports them. The last week is still in progress. */
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

// Related series share a hue: gains are tints of the first palette color, churn steps of the text
// colors, so every step stays visible in light and dark. Each reads a CSS variable first, so a
// theme can set the exact colors.
const gain = (percent: number) => `color-mix(in oklab, var(--cl-color-chart-1) ${percent}%, white)`;
const faintText = 'color-mix(in oklab, var(--cl-color-foreground-secondary) 50%, var(--cl-color-surface))';

const series: ChartSeries<GrowthRow>[] = [
  { key: 'retained', label: 'Retained', color: `var(--users-retained, ${gain(100)})`, value: row => row.retained },
  {
    key: 'reactivated',
    label: 'Reactivated',
    color: `var(--users-reactivated, ${gain(60)})`,
    value: row => row.reactivated,
  },
  { key: 'new', label: 'New', color: `var(--users-new, ${gain(30)})`, value: row => row.new },
  {
    key: 'retainedChurned',
    label: 'Retained churned',
    color: `var(--churned-retained, var(--cl-color-foreground))`,
    value: row => row.retainedChurned,
  },
  {
    key: 'reactivatedChurned',
    label: 'Reactivated churned',
    color: `var(--churned-reactivated, var(--cl-color-foreground-secondary))`,
    value: row => row.reactivatedChurned,
  },
  { key: 'newChurned', label: 'New churned', color: `var(--churned-new, ${faintText})`, value: row => row.newChurned },
];

const getWeek = (row: GrowthRow) => row.week;

const lastWeek = growth.length - 1;

/** The week in progress, projected from its pace so far. */
const projection = {
  datumIndex: lastWeek,
  value: 245,
  label: 'Projected',
  description: 'Projected active users for the week in progress',
};

export function Default() {
  const chart = Chart.useBarChart({ data: growth, series, index: getWeek, projection });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly active users'
    >
      <Chart.Legend />
      <Chart.Grid />
      <Chart.StackedBars>
        <Chart.Bar />
        <Chart.ProjectionOutline />
        <Chart.YLine value={0} />
      </Chart.StackedBars>
      <Chart.YAxis />
      <Chart.XAxis ticks='calendar' />
      <Chart.Selection>
        <Chart.Cursor />
        <Chart.Tooltip />
      </Chart.Selection>
    </Chart.Root>
  );
}

type Day = { day: string; violet: number; sky: number; orange: number; cyan: number; gold: number; steel: number };

const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => ({
  day,
  violet: 12 + i,
  sky: 10 + ((i * 3) % 5),
  orange: 9 + ((i * 2) % 4),
  cyan: 11 - i,
  gold: 8 + ((i * 4) % 6),
  steel: 10 + (i % 3),
}));

const palette: ChartSeries<Day>[] = [
  { key: 'violet', label: 'Slot 1', color: 1, value: day => day.violet },
  { key: 'sky', label: 'Slot 2', color: 2, value: day => day.sky },
  { key: 'orange', label: 'Slot 3', color: 3, value: day => day.orange },
  { key: 'cyan', label: 'Slot 4', color: 4, value: day => day.cyan },
  { key: 'gold', label: 'Slot 5', color: 5, value: day => day.gold },
  { key: 'steel', label: 'Slot 6', color: 6, value: day => day.steel },
];

const getDay = (day: Day) => day.day;

/** Every part, each with its default children. */
function DefaultParts() {
  return (
    <>
      <Chart.Legend />
      <Chart.Grid />
      <Chart.StackedBars />
      <Chart.YAxis />
      <Chart.XAxis />
      <Chart.Selection />
    </>
  );
}

export function Palette() {
  const chart = Chart.useBarChart({ data: days, series: palette, index: getDay });
  return (
    <Chart.Root
      chart={chart}
      aria-label='The six palette slots'
    >
      <DefaultParts />
    </Chart.Root>
  );
}

export function Highlight() {
  const [selection, setSelection] = useState<BarSelection | null>({ category: '2026-02-16', section: 'positive' });
  const chart = Chart.useBarChart({
    data: growth,
    series,
    index: getWeek,
    selection,
    onSelectionChange: next => setSelection(next ?? selection),
    highlight: selection,
  });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly active users'
    >
      <DefaultParts />
    </Chart.Root>
  );
}

export function Projection() {
  const chart = Chart.useBarChart({
    data: growth,
    series,
    index: getWeek,
    projection,
  });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly active users'
    >
      <DefaultParts />
    </Chart.Root>
  );
}

export function Empty() {
  const chart = Chart.useBarChart({ data: [], series, index: getWeek });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly active users'
    >
      <DefaultParts />
    </Chart.Root>
  );
}

export function RenderError() {
  const root = useRef<HTMLDivElement>(null);
  const chart = Chart.useBarChart({ data: growth, series, index: getWeek });
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start', width: '100%' }}>
      <Button
        variant='outline'
        size='sm'
        onClick={() => root.current?.querySelector('canvas')?.dispatchEvent(new Event('contextlost'))}
      >
        Lose the Canvas context
      </Button>
      <Chart.Root
        ref={root}
        chart={chart}
        aria-label='Weekly active users'
      >
        <DefaultParts />
      </Chart.Root>
    </div>
  );
}

export function DarkMode() {
  const chart = Chart.useBarChart({
    data: growth,
    series,
    index: getWeek,
    projection,
  });
  return (
    <div
      style={{
        colorScheme: 'dark',
        background: 'var(--cl-color-surface)',
        color: 'var(--cl-color-foreground)',
        padding: 16,
        borderRadius: 8,
        width: '100%',
      }}
    >
      <Chart.Root
        chart={chart}
        aria-label='Weekly active users'
      >
        <DefaultParts />
      </Chart.Root>
    </div>
  );
}
