import { render, screen } from '@testing-library/react';
import { useCallback, useRef } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { BarChart, type BarIdentity, type BarProjection } from '../index';

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
const formatWeek = (week: string) => week.slice(5);
const projection: BarProjection = { datumIndex: 5, value: 120 };

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = `
    .chart { width: 640px; font-size: 12px; background: white; }
    .grid-line { stroke: #d4d4d4; stroke-dasharray: 1 3; }
    .zero-line { stroke: #171717; stroke-width: 2; }
    .tick { fill: #525252; }
    .projection-outline { fill: none; stroke: #525252; stroke-dasharray: 3 3; }
    .bar { max-width: 32px; row-gap: 2px; border-radius: 4px 4px 2px 2px; color: var(--bar); }
    .bar[data-series='signups'] { --bar: #6d28d9; }
    .bar[data-series='returning'] { --bar: #0ea5e9; }
    .bar[data-series='churned'] { --bar: #f97316; }
    .bar[data-inactive] { color: color-mix(in srgb, var(--bar) 40%, white); }
    .bar[data-projection] { color: #e5e5e5; }
    .cursor { background: #a3a3a3; opacity: 0.15; }
    .tooltip { background: white; border: 1px solid #d4d4d4; border-radius: 6px; padding: 8px; }
  `;
  document.head.append(style);
});

function GrowthChart({
  selected,
  projected = false,
}: {
  selected?: { week: string; positive: boolean };
  projected?: boolean;
}) {
  const boundary = useRef<HTMLDivElement>(null);
  const layout = BarChart.useStackedBarLayout({
    data: growth,
    series,
    index: getWeek,
    projection: projected ? projection : undefined,
  });
  const isBarActive = useCallback(
    (bar: BarIdentity<GrowthRow>) =>
      !selected || (bar.datum.week === selected.week && bar.positive === selected.positive),
    [selected],
  );
  return (
    <div
      ref={boundary}
      className='chart'
      data-testid='chart'
    >
      <BarChart.Root
        layout={layout}
        height={320}
        aria-label='Weekly growth'
      >
        <BarChart.Grid>
          {lines =>
            lines.map(line => (
              <BarChart.GridLine
                key={line.value}
                line={line}
                className='grid-line'
              />
            ))
          }
        </BarChart.Grid>
        <BarChart.StackedBars<GrowthRow> isBarActive={isBarActive}>
          <BarChart.Bar className='bar' />
          <BarChart.ProjectionOutline className='projection-outline' />
          <BarChart.ZeroLine className='zero-line' />
        </BarChart.StackedBars>
        <BarChart.YAxis>
          {ticks =>
            ticks.map(tick => (
              <BarChart.YTick
                key={tick.value}
                tick={tick}
                className='tick'
              />
            ))
          }
        </BarChart.YAxis>
        <BarChart.XAxis format={formatWeek}>
          {ticks =>
            ticks.map(tick => (
              <BarChart.XTick
                key={tick.key}
                tick={tick}
                className='tick'
              />
            ))
          }
        </BarChart.XAxis>
        <BarChart.BarSelection<GrowthRow> formatCategory={formatWeek}>
          <BarChart.Cursor className='cursor' />
          <BarChart.Tooltip<GrowthRow>
            className='tooltip'
            boundaryRef={boundary}
          >
            {({ datum }) => (
              <>
                <div>{datum.week}</div>
                <div>Sign-ups: {datum.signups}</div>
                <div>Churned: {datum.churned}</div>
              </>
            )}
          </BarChart.Tooltip>
        </BarChart.BarSelection>
      </BarChart.Root>
    </div>
  );
}

async function renderChart(ui: React.ReactElement) {
  render(ui);
  await expect.poll(() => screen.queryByRole('img', { name: 'Weekly growth' })).toBeTruthy();
  await document.fonts.ready;
  return page.elementLocator(screen.getByTestId('chart'));
}

describe('BarChart visual state', () => {
  it('stacks values above and below zero', async () => {
    const chart = await renderChart(<GrowthChart />);
    await expect(chart).toMatchScreenshot('bar-chart-diverging');
  });

  it('dims every bar outside the selected section', async () => {
    const chart = await renderChart(<GrowthChart selected={{ week: '2026-01-26', positive: true }} />);
    await expect(chart).toMatchScreenshot('bar-chart-dimmed-selection');
  });

  it('draws a projection above the latest bar', async () => {
    const chart = await renderChart(<GrowthChart projected />);
    await expect(chart).toMatchScreenshot('bar-chart-projection');
  });

  it('opens the tooltip beside the selected period', async () => {
    const chart = await renderChart(<GrowthChart />);
    screen.getByRole('group', { name: 'Weekly growth' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .poll(() => screen.queryByText('Sign-ups: 52')?.closest<HTMLElement>('.tooltip')?.style.visibility)
      .toBe('');
    await expect(chart).toMatchScreenshot('bar-chart-tooltip-open');
  });
});
