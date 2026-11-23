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

const growth = [
  { week: '2026-01-05', signups: 40, returning: 22, churned: -14 },
  { week: '2026-01-12', signups: 52, returning: 30, churned: -18 },
  { week: '2026-01-19', signups: 36, returning: 26, churned: -22 },
  { week: '2026-01-26', signups: 61, returning: 34, churned: -12 },
  { week: '2026-02-02', signups: 48, returning: 29, churned: -25 },
  { week: '2026-02-09', signups: 55, returning: 41, churned: -17 },
];

type GrowthRow = (typeof growth)[number];

const series: ChartSeries<GrowthRow>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'returning', label: 'Returning', color: 2, value: row => row.returning },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

const getWeek = (row: GrowthRow) => row.week;

export function Default() {
  const chart = Chart.useBarChart({ data: growth, series, index: getWeek });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly growth'
    >
      <Chart.Legend />
      <Chart.Grid />
      <Chart.StackedBars>
        <Chart.Bar />
        <Chart.YLine value={0} />
      </Chart.StackedBars>
      <Chart.YAxis />
      <Chart.XAxis />
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
  const [selection, setSelection] = useState<BarSelection | null>({ category: '2026-02-02', section: 'positive' });
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
      aria-label='Weekly growth'
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
    projection: {
      datumIndex: growth.length - 1,
      value: 115,
      label: 'Projected',
      description: 'Projected sign-ups and returning users for the week in progress',
    },
  });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly growth'
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
      aria-label='Weekly growth'
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
        aria-label='Weekly growth'
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
    projection: { datumIndex: growth.length - 1, value: 115, label: 'Projected' },
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
        aria-label='Weekly growth'
      >
        <DefaultParts />
      </Chart.Root>
    </div>
  );
}
