import { cleanup, render, screen, within } from '@testing-library/react';
import type {} from '@vitest/browser-playwright';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cdp, page } from 'vitest/browser';

import { MosaicLocalizationProvider, resolveLocalization } from '../../../localization';
import { type ActiveBar, type BarChartHighlight, Chart, type ChartSeries } from '..';

type Row = { period: string; a: number; b: number; c: number };

const rows: Row[] = [
  { period: 'A', a: 10, b: 10, c: 10 },
  { period: 'B', a: 10, b: 10, c: 10 },
  { period: 'C', a: 10, b: 10, c: 10 },
];

const series: ChartSeries<Row>[] = [
  { key: 'a', label: 'Series A', color: 1, value: row => row.a },
  { key: 'b', label: 'Series B', color: 2, value: row => row.b },
  { key: 'c', label: 'Series C', color: 3, value: row => row.c },
];

const index = (row: Row) => row.period;

type Rgba = readonly [number, number, number, number];

// The palette and its 40% mix with the surface, as tokens.md lists them.
const VIOLET: Rgba = [124, 58, 237, 255];
const SKY: Rgba = [1, 132, 188, 255];
const ORANGE: Rgba = [212, 94, 0, 255];
const VIOLET_DIMMED: Rgba = [197, 183, 254, 255];
const VIOLET_DARK: Rgba = [139, 86, 249, 255];

beforeAll(async () => {
  await page.viewport(1280, 900);
});

afterEach(async () => {
  cleanup();
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

function GrowthChart({
  series: growthSeries = series,
  highlight,
  onRenderError,
}: Readonly<{
  series?: ChartSeries<Row>[];
  highlight?: BarChartHighlight;
  onRenderError?: (error: Error) => void;
}>) {
  const chart = Chart.useBarChart({ data: rows, index, series: growthSeries, highlight });
  return (
    <div style={{ width: 640, colorScheme: 'light dark' }}>
      <Chart.Root
        chart={chart}
        aria-label='Growth'
        onRenderError={onRenderError}
      >
        <Chart.Legend />
        <Chart.Grid />
        <Chart.Bars />
        <Chart.YAxis />
        <Chart.XAxis />
        <Chart.Selection />
      </Chart.Root>
    </div>
  );
}

async function renderChart(element: React.ReactElement) {
  const view = render(element);
  await expect.poll(() => screen.queryByRole('img', { name: 'Growth' })).toBeTruthy();
  return view;
}

function canvas() {
  const element = screen.getByRole('img', { name: 'Growth' });
  if (!(element instanceof HTMLCanvasElement)) {
    throw new Error('The chart image is not a canvas');
  }
  return element;
}

/** The interaction surface: a group, or a button when the chart has `onActivate`. */
function surface() {
  return screen.queryByRole('button', { name: 'Growth' }) ?? screen.getByRole('group', { name: 'Growth' });
}

function plot() {
  return surface().getBoundingClientRect();
}

/** The middle of a series' segment in a category, in client coordinates. */
function segmentCenter(category: number, position: number) {
  const box = plot();
  const step = box.width / rows.length;
  return { x: box.left + step * (category + 0.5), y: box.bottom - (box.height * (position + 0.5)) / 3 };
}

function canvasPixel({ x, y }: { x: number; y: number }): Rgba {
  const element = canvas();
  const box = element.getBoundingClientRect();
  const ratio = element.width / box.width;
  const data = element
    .getContext('2d')
    ?.getImageData(Math.round((x - box.left) * ratio), Math.round((y - box.top) * ratio), 1, 1).data;
  return [data?.[0] ?? -1, data?.[1] ?? -1, data?.[2] ?? -1, data?.[3] ?? -1];
}

/** The composited pixel on screen, so layers above and below the Canvas count. */
async function screenPixel({ x, y }: { x: number; y: number }): Promise<Rgba> {
  const target = document.body;
  const base64 = await page.screenshot({ element: target, save: false });
  const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
  const ratio = bitmap.width / target.getBoundingClientRect().width;
  const scratch = new OffscreenCanvas(1, 1);
  const context = scratch.getContext('2d');
  context?.drawImage(bitmap, Math.round(x * ratio), Math.round(y * ratio), 1, 1, 0, 0, 1, 1);
  const data = context?.getImageData(0, 0, 1, 1).data;
  return [data?.[0] ?? -1, data?.[1] ?? -1, data?.[2] ?? -1, data?.[3] ?? -1];
}

function near(actual: Rgba, expected: Rgba) {
  return actual.every((channel, i) => Math.abs(channel - (expected[i] ?? 0)) <= 1);
}

function hover({ x, y }: { x: number; y: number }) {
  surface().dispatchEvent(
    new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y, pointerType: 'mouse' }),
  );
}

describe('Chart.Legend', () => {
  it('grows a described item to a fingertip-sized target under a coarse pointer', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    try {
      render(
        <div style={{ padding: 40 }}>
          <Chart.Legend items={[{ key: 'a', label: 'Series A', color: 1, description: 'About A' }]} />
        </div>,
      );
      const trigger = screen.getByRole('button', { name: 'Series A' });
      const box = trigger.getBoundingClientRect();
      const reach = (44 - box.height) / 2 - 1;

      expect(reach).toBeGreaterThan(0);
      expect(document.elementFromPoint(box.left + box.width / 2, box.top - reach)).toBe(trigger);
      expect(document.elementFromPoint(box.left + box.width / 2, box.bottom + reach)).toBe(trigger);
    } finally {
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false });
    }
  });
});

describe('Chart parts', () => {
  it('paints each series in its palette slot', async () => {
    await renderChart(<GrowthChart />);
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'ready');

    for (const [position, color] of [VIOLET, SKY, ORANGE].entries()) {
      await expect.poll(() => near(canvasPixel(segmentCenter(1, position)), color)).toBe(true);
    }
  });

  it('dims the bars outside the highlight with an opaque mix that hides the grid line', async () => {
    await renderChart(<GrowthChart highlight={{ category: 'B' }} />);
    const gridLine = [...document.querySelectorAll('.cl-chart-grid-line')].find(line => {
      const y = line.getBoundingClientRect().top;
      const bottom = plot().bottom;
      return y < bottom - 10 && y > bottom - plot().height / 3 + 10;
    });
    if (!gridLine) {
      throw new Error('No grid line crosses the first segment');
    }
    const onLine = { x: segmentCenter(0, 0).x, y: gridLine.getBoundingClientRect().top + 0.5 };

    await expect.poll(() => near(canvasPixel(onLine), VIOLET_DIMMED)).toBe(true);
    expect(near(await screenPixel(onLine), VIOLET_DIMMED)).toBe(true);
    expect(near(canvasPixel(segmentCenter(1, 0)), VIOLET)).toBe(true);
  });

  it('keeps the highlighted series at full strength and dims the others', async () => {
    await renderChart(<GrowthChart highlight={{ series: 'b' }} />);

    await expect.poll(() => near(canvasPixel(segmentCenter(1, 1)), SKY)).toBe(true);
    expect(near(canvasPixel(segmentCenter(1, 0)), VIOLET_DIMMED)).toBe(true);
  });

  it('colors the grid, labels and tooltip from the border, secondary text and surface tokens', async () => {
    const root = document.documentElement.style;
    const tokens = {
      '--cl-color-border': 'rgb(255, 0, 0)',
      '--cl-color-foreground-secondary': 'rgb(0, 128, 0)',
      '--cl-color-surface': 'rgb(0, 0, 255)',
    };
    for (const [name, value] of Object.entries(tokens)) {
      root.setProperty(name, value);
    }
    try {
      await renderChart(<GrowthChart />);

      expect(getComputedStyle(document.querySelector('.cl-chart-grid-line') as Element).stroke).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(document.querySelector('.cl-chart-y-tick') as Element).fill).toBe('rgb(0, 128, 0)');

      hover(segmentCenter(1, 1));
      await expect.poll(() => document.querySelector('.cl-chart-tooltip')).toBeTruthy();
      expect(getComputedStyle(document.querySelector('.cl-chart-tooltip') as Element).backgroundColor).toBe(
        'rgb(0, 0, 255)',
      );
    } finally {
      for (const name of Object.keys(tokens)) {
        root.removeProperty(name);
      }
    }
  });

  it('does not dim on hover without a highlight, and draws the hover band behind the bars', async () => {
    await renderChart(<GrowthChart />);
    const bar = segmentCenter(1, 0);
    await expect.poll(() => near(canvasPixel(bar), VIOLET)).toBe(true);
    const besideBar = { x: bar.x + 40, y: bar.y };
    const bandBefore = await screenPixel(besideBar);

    hover(bar);

    await expect.poll(() => document.querySelector('.cl-chart-cursor')).toBeTruthy();
    await expect.poll(async () => near(await screenPixel(besideBar), bandBefore)).toBe(false);
    expect(near(await screenPixel(bar), VIOLET)).toBe(true);
    expect(near(canvasPixel(segmentCenter(0, 0)), VIOLET)).toBe(true);
    expect(document.elementFromPoint(bar.x, bar.y)).toBe(surface());
  });

  it('opens a tooltip with the period and one row per series, top of the stack first', async () => {
    await renderChart(<GrowthChart />);

    hover(segmentCenter(1, 1));

    await expect.poll(() => document.querySelector('.cl-chart-tooltip-content')).toBeTruthy();
    const content = document.querySelector('.cl-chart-tooltip-content');
    expect(content?.querySelector('.cl-chart-tooltip-heading')?.textContent).toBe('B');
    expect([...(content?.querySelectorAll('.cl-chart-tooltip-row') ?? [])].map(row => row.textContent)).toEqual([
      'Series C10',
      'Series B10',
      'Series A10',
    ]);
  });

  it('repaints when the preferred color scheme flips to dark', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await renderChart(<GrowthChart />);
    const bar = segmentCenter(1, 0);
    await expect.poll(() => near(canvasPixel(bar), VIOLET)).toBe(true);

    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });

    await expect.poll(() => near(canvasPixel(bar), VIOLET_DARK)).toBe(true);
  });

  it('offers a retry when the Canvas cannot paint, and paints again after it', async () => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    const errors: Error[] = [];
    HTMLCanvasElement.prototype.getContext = () => null;
    try {
      render(<GrowthChart onRenderError={error => errors.push(error)} />);
      expect(within(await screen.findByRole('alert')).getByText('The chart could not be displayed.')).toBeVisible();
      expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'error');
      expect(errors.map(error => error.name)).toEqual(['CanvasRenderError']);
    } finally {
      HTMLCanvasElement.prototype.getContext = getContext;
    }

    screen.getByRole('button', { name: 'Try again' }).click();

    await expect.poll(() => screen.queryByRole('img', { name: 'Growth' })).toBeTruthy();
    await expect.poll(() => near(canvasPixel(segmentCenter(1, 0)), VIOLET)).toBe(true);
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'ready');
  });

  it('repaints when a series changes color', async () => {
    const { rerender } = await renderChart(<GrowthChart />);
    const bar = segmentCenter(1, 0);
    await expect.poll(() => near(canvasPixel(bar), VIOLET)).toBe(true);

    rerender(<GrowthChart series={series.map(entry => (entry.key === 'a' ? { ...entry, color: 3 } : entry))} />);

    await expect.poll(() => near(canvasPixel(bar), ORANGE)).toBe(true);
  });
});

type Week = { week: string; signups: number; returning: number };

const weeks: Week[] = [{ week: '2026-01-05', signups: 40, returning: 22 }];

const weekSeries: ChartSeries<Week>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'returning', label: 'Returning', color: 2, value: row => row.returning },
];

const getWeek = (row: Week) => row.week;

function WeekChart({
  data = weeks,
  projection,
  renderEmptyState,
  children = <Chart.Legend />,
}: Readonly<{
  data?: Week[];
  projection?: { datumIndex: number; value: number; label?: string };
  renderEmptyState?: () => React.ReactNode;
  children?: React.ReactNode;
}>) {
  const chart = Chart.useBarChart({ data, index: getWeek, series: weekSeries, projection });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Growth'
      renderEmptyState={renderEmptyState}
    >
      {children}
    </Chart.Root>
  );
}

describe('Chart.Legend in a chart', () => {
  it('reads the series from the chart and sits above the plot', () => {
    render(<WeekChart />);

    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['Sign-ups', 'Returning']);
    const legend = document.querySelector('.cl-chart-legend');
    const plot = document.querySelector('.cl-chart-plot');
    expect(legend?.closest('.cl-chart-plot')).toBeNull();
    expect(legend && plot && legend.compareDocumentPosition(plot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('adds a labelled projection as a dashed entry', () => {
    render(<WeekChart projection={{ datumIndex: 0, value: 80, label: 'Projected' }} />);

    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'Sign-ups',
      'Returning',
      'Projected',
    ]);
    expect(screen.getByText('Projected').querySelector('.cl-chart-swatch')).toHaveAttribute('data-swatch', 'dashed');
  });

  it('renders each label through its children and keeps the swatch', () => {
    render(<WeekChart>{<Chart.Legend>{item => `${item.label} (weekly)`}</Chart.Legend>}</WeekChart>);

    const items = screen.getAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual(['Sign-ups (weekly)', 'Returning (weekly)']);
    expect(items[0]?.querySelector('.cl-chart-swatch')).toHaveAttribute('data-swatch', 'square');
  });
});

describe('Chart.Root states', () => {
  it('is ready with rows', () => {
    render(<WeekChart />);

    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'ready');
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-chart', 'bar');
    expect(screen.queryByText('No data to show')).toBeNull();
  });

  it('shows the default empty state without rows', () => {
    render(<WeekChart data={[]} />);

    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'empty');
  });

  it('renders the caller empty state instead', () => {
    render(
      <WeekChart
        data={[]}
        renderEmptyState={() => <p>Connect a data source</p>}
      />,
    );

    expect(screen.getByText('Connect a data source')).toBeInTheDocument();
    expect(screen.queryByText('No data to show')).toBeNull();
  });
});

function CustomTooltipChart() {
  const chart = Chart.useBarChart({ data: rows, index, series });
  return (
    <div style={{ width: 640 }}>
      <Chart.Root
        chart={chart}
        aria-label='Growth'
      >
        <Chart.Bars />
        <Chart.Selection>
          <Chart.Tooltip<ActiveBar<Row>>>
            {({ heading, active }) => (
              <p className='custom-tooltip'>{`${heading}: ${active.datum.a + active.datum.b}`}</p>
            )}
          </Chart.Tooltip>
        </Chart.Selection>
      </Chart.Root>
    </div>
  );
}

describe('Chart.Selection', () => {
  it('describes the keys in the language of the localization', async () => {
    await renderChart(
      <MosaicLocalizationProvider
        value={resolveLocalization({
          overrides: {
            chart: {
              keyboardNavigate: 'Gauche et Droite choisissent une période.',
              keyboardSections: 'Haut et Bas choisissent une section.',
              keyboardDismiss: 'Échap ferme.',
            },
          },
        })}
      >
        <GrowthChart />
      </MosaicLocalizationProvider>,
    );
    expect(surface()).toHaveAccessibleDescription(
      'Gauche et Droite choisissent une période. Haut et Bas choisissent une section. Échap ferme.',
    );
  });
});

describe('Chart.Tooltip', () => {
  it('renders its children with the selected period instead of the default rows', async () => {
    await renderChart(<CustomTooltipChart />);

    hover(segmentCenter(1, 1));

    await expect.poll(() => document.querySelector('.custom-tooltip')?.textContent).toBe('B: 20');
    expect(document.querySelector('.cl-chart-tooltip-content')).toBeNull();
  });
});
