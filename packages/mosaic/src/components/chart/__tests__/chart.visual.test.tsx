import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { Chart, type ChartSeries } from '..';

const weeks = [
  { week: '2026-01-05', signups: 40, returning: 22, churned: -14 },
  { week: '2026-01-12', signups: 52, returning: 30, churned: -18 },
  { week: '2026-01-19', signups: 36, returning: 26, churned: -22 },
  { week: '2026-01-26', signups: 61, returning: 34, churned: -12 },
  { week: '2026-02-02', signups: 48, returning: 29, churned: -25 },
  { week: '2026-02-09', signups: 55, returning: 41, churned: -17 },
];

type Week = (typeof weeks)[number];

const series: ChartSeries<Week>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: week => week.signups },
  { key: 'returning', label: 'Returning', color: 2, value: week => week.returning },
  { key: 'churned', label: 'Churned', color: 3, value: week => week.churned },
];

const getWeek = (week: Week) => week.week;

afterEach(() => {
  document.documentElement.style.colorScheme = '';
});

function WeeklyGrowth() {
  const chart = Chart.useBarChart({
    data: weeks,
    index: getWeek,
    series,
    highlight: { category: '2026-01-26' },
    projection: { datumIndex: 5, value: 120, label: 'Projected' },
  });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Weekly growth'
    >
      <Chart.Legend />
      <Chart.Grid />
      <Chart.Bars>
        <Chart.Bar />
        <Chart.ProjectionOutline />
        <Chart.YLine value={0} />
      </Chart.Bars>
      <Chart.YAxis />
      <Chart.XAxis ticks='calendar' />
      <Chart.Selection>
        <Chart.Cursor />
        <Chart.Tooltip />
      </Chart.Selection>
    </Chart.Root>
  );
}

async function renderChart() {
  render(
    <div
      data-testid='frame'
      style={{ width: 640, padding: 16, background: 'var(--cl-color-surface)' }}
    >
      <WeeklyGrowth />
    </div>,
  );
  await screen.findByRole('img', { name: 'Weekly growth' });
  return screen.getByTestId('frame');
}

describe('Chart visual states', () => {
  it('draws the palette, a dimmed highlight and a projection in light mode', async () => {
    const chart = await renderChart();

    await expect(page.elementLocator(chart)).toMatchScreenshot('chart-light');
  });

  it('draws the palette, a dimmed highlight and a projection in dark mode', async () => {
    document.documentElement.style.colorScheme = 'dark';
    const chart = await renderChart();

    await expect(page.elementLocator(chart)).toMatchScreenshot('chart-dark');
  });
});
