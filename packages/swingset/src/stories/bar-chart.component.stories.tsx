'use client';

import { BarChart, type BarChartProps, type BarSelection } from '@clerk/mosaic/components/bar-chart';
import { Button } from '@clerk/mosaic/components/button';
import type { ChartSeries } from '@clerk/mosaic/components/chart';
import { useRef, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './bar-chart.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'BarChart',
  label: 'Bar Chart',
  source: 'packages/mosaic/src/components/bar-chart/bar-chart.tsx',
  styles: {
    _variants: {
      showLegend: { true: {}, false: {} },
      showGrid: { true: {}, false: {} },
      showXAxis: { true: {}, false: {} },
      showYAxis: { true: {}, false: {} },
      xTicks: { category: {}, calendar: {} },
      interactive: { true: {}, false: {} },
    },
    _defaultVariants: {
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      xTicks: 'calendar',
      interactive: true,
    },
  },
};

type Week = { week: string; signups: number; returning: number; churned: number };

const weeks: Week[] = [
  { week: '2026-01-05', signups: 40, returning: 22, churned: -14 },
  { week: '2026-01-12', signups: 52, returning: 30, churned: -18 },
  { week: '2026-01-19', signups: 36, returning: 26, churned: -22 },
  { week: '2026-01-26', signups: 61, returning: 34, churned: -12 },
  { week: '2026-02-02', signups: 48, returning: 29, churned: -25 },
  { week: '2026-02-09', signups: 55, returning: 41, churned: -17 },
  { week: '2026-02-16', signups: 66, returning: 38, churned: -20 },
  { week: '2026-02-23', signups: 30, returning: 21, churned: -9 },
];

const growth: ChartSeries<Week>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: week => week.signups },
  { key: 'returning', label: 'Returning', color: 2, value: week => week.returning },
  { key: 'churned', label: 'Churned', color: 3, value: week => week.churned },
];

const getWeek = (week: Week) => week.week;

// Knobs are dynamically typed; the chart's props are not.
function knobsAsProps(props: Record<string, unknown>) {
  return props as Partial<BarChartProps<Week>>;
}

export function Playground(props: Record<string, unknown>) {
  return (
    <BarChart
      aria-label='Weekly growth'
      data={weeks}
      index={getWeek}
      series={growth}
      {...knobsAsProps(props)}
    />
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

export function Palette() {
  return (
    <BarChart
      aria-label='The six palette slots'
      data={days}
      index={getDay}
      series={palette}
    />
  );
}

export function Highlight() {
  const [selection, setSelection] = useState<BarSelection | null>({ category: '2026-02-02', section: 'positive' });
  return (
    <BarChart
      aria-label='Weekly growth'
      data={weeks}
      index={getWeek}
      series={growth}
      xTicks='calendar'
      selection={selection}
      onSelectionChange={next => setSelection(next ?? selection)}
      highlight={selection}
    />
  );
}

export function Projection() {
  return (
    <BarChart
      aria-label='Weekly growth'
      data={weeks}
      index={getWeek}
      series={growth}
      xTicks='calendar'
      projection={{
        datumIndex: weeks.length - 1,
        value: 95,
        label: 'Projected',
        description: 'Projected sign-ups and returning users for the week in progress',
      }}
    />
  );
}

export function Empty() {
  return (
    <BarChart
      aria-label='Weekly growth'
      data={[]}
      index={getWeek}
      series={growth}
    />
  );
}

export function RenderError() {
  const chart = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start', width: '100%' }}>
      <Button
        variant='outline'
        size='sm'
        onClick={() => chart.current?.querySelector('canvas')?.dispatchEvent(new Event('contextlost'))}
      >
        Lose the Canvas context
      </Button>
      <BarChart
        ref={chart}
        aria-label='Weekly growth'
        data={weeks}
        index={getWeek}
        series={growth}
        xTicks='calendar'
      />
    </div>
  );
}

export function DarkMode() {
  return (
    <div
      style={{
        colorScheme: 'dark',
        background: 'var(--cl-color-surface)',
        color: 'var(--cl-color-foreground)',
        padding: 16,
        borderRadius: 8,
      }}
    >
      <BarChart
        aria-label='Weekly growth'
        data={weeks}
        index={getWeek}
        series={growth}
        xTicks='calendar'
        projection={{ datumIndex: weeks.length - 1, value: 95, label: 'Projected' }}
      />
    </div>
  );
}
