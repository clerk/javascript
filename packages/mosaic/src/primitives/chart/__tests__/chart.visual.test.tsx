import { render, screen } from '@testing-library/react';
import { useCallback, useRef } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type ActiveBar, type BarIdentity, type BarProjection, Chart } from '..';

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
  const isBarActive = useCallback(
    (bar: BarIdentity<GrowthRow>) =>
      !selected || (bar.datum.week === selected.week && bar.positive === selected.positive),
    [selected],
  );
  const chart = Chart.useBarChart({
    data: growth,
    series,
    index: getWeek,
    projection: projected ? projection : undefined,
    isBarActive,
    formatCategory: formatWeek,
  });
  return (
    <div
      ref={boundary}
      className='chart'
      data-testid='chart'
    >
      <Chart.Root
        chart={chart}
        height={320}
        aria-label='Weekly growth'
      >
        <Chart.Grid>
          {ticks =>
            ticks.map(tick => (
              <Chart.YLine
                key={tick.value}
                value={tick.value}
                className='grid-line'
              />
            ))
          }
        </Chart.Grid>
        <Chart.Bars>
          <Chart.Bar className='bar' />
          <Chart.ProjectionOutline className='projection-outline' />
          <Chart.YLine
            value={0}
            className='zero-line'
          />
        </Chart.Bars>
        <Chart.YAxis>
          {ticks =>
            ticks.map(tick => (
              <Chart.YTick
                key={tick.value}
                tick={tick}
                className='tick'
              />
            ))
          }
        </Chart.YAxis>
        <Chart.XAxis format={formatWeek}>
          {ticks =>
            ticks.map(tick => (
              <Chart.XTick
                key={tick.key}
                tick={tick}
                className='tick'
              />
            ))
          }
        </Chart.XAxis>
        <Chart.Selection>
          <Chart.Cursor className='cursor' />
          <Chart.Tooltip<ActiveBar<GrowthRow>> collisionBoundary={boundary}>
            {({ datum }) => (
              <Chart.TooltipPortal>
                <Chart.TooltipPositioner>
                  <Chart.TooltipPopup className='tooltip'>
                    <div>{datum.week}</div>
                    <div>Sign-ups: {datum.signups}</div>
                    <div>Churned: {datum.churned}</div>
                  </Chart.TooltipPopup>
                </Chart.TooltipPositioner>
              </Chart.TooltipPortal>
            )}
          </Chart.Tooltip>
        </Chart.Selection>
      </Chart.Root>
    </div>
  );
}

async function renderChart(ui: React.ReactElement) {
  render(ui);
  await expect.poll(() => screen.queryByRole('img', { name: 'Weekly growth' })).toBeTruthy();
  await document.fonts.ready;
  return page.elementLocator(screen.getByTestId('chart'));
}

describe('Chart stacked bars visual state', () => {
  it('stacks values above and below zero', async () => {
    const chart = await renderChart(<GrowthChart />);
    await expect(chart).toMatchScreenshot('stacked-bars-diverging');
  });

  it('dims every bar outside the selected section', async () => {
    const chart = await renderChart(<GrowthChart selected={{ week: '2026-01-26', positive: true }} />);
    await expect(chart).toMatchScreenshot('stacked-bars-dimmed-selection');
  });

  it('draws a projection above the latest bar', async () => {
    const chart = await renderChart(<GrowthChart projected />);
    await expect(chart).toMatchScreenshot('stacked-bars-projection');
  });

  it('opens the tooltip beside the selected period', async () => {
    const chart = await renderChart(<GrowthChart />);
    screen.getByRole('group', { name: 'Weekly growth' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect
      .poll(() => screen.queryByText('Sign-ups: 52')?.closest<HTMLElement>('[data-side]')?.style.visibility)
      .toBe('');
    await expect(chart).toMatchScreenshot('stacked-bars-tooltip-open');
  });
});
