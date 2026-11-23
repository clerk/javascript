import { cleanup, render, screen } from '@testing-library/react';
import type {} from '@vitest/browser-playwright';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cdp, page } from 'vitest/browser';

import type { ChartSeries } from '../../chart';
import { BarChart, type BarChartProps } from '../bar-chart';

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

function Chart(props: Partial<BarChartProps<Row>>) {
  return (
    <div style={{ width: 640, colorScheme: 'light dark' }}>
      <BarChart
        aria-label='Growth'
        data={rows}
        index={index}
        series={series}
        {...props}
      />
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

function plot() {
  const element = document.querySelector('[data-chart-interaction]');
  if (!element) {
    throw new Error('The chart has no interaction surface');
  }
  return element.getBoundingClientRect();
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
  const surface = document.querySelector('[data-chart-interaction]');
  surface?.dispatchEvent(
    new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y, pointerType: 'mouse' }),
  );
}

describe('BarChart', () => {
  it('paints each series in its palette slot', async () => {
    await renderChart(<Chart />);
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'ready');

    for (const [position, color] of [VIOLET, SKY, ORANGE].entries()) {
      await expect.poll(() => near(canvasPixel(segmentCenter(1, position)), color)).toBe(true);
    }
  });

  it('dims the bars outside the highlight with an opaque mix that hides the grid line', async () => {
    await renderChart(<Chart highlight={{ category: 'B' }} />);
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

  it('does not dim on hover without a highlight, and draws the hover band behind the bars', async () => {
    await renderChart(<Chart />);
    const bar = segmentCenter(1, 0);
    await expect.poll(() => near(canvasPixel(bar), VIOLET)).toBe(true);
    const besideBar = { x: bar.x + 40, y: bar.y };
    const bandBefore = await screenPixel(besideBar);

    hover(bar);

    await expect.poll(() => document.querySelector('.cl-chart-cursor')).toBeTruthy();
    await expect.poll(async () => near(await screenPixel(besideBar), bandBefore)).toBe(false);
    expect(near(await screenPixel(bar), VIOLET)).toBe(true);
    expect(near(canvasPixel(segmentCenter(0, 0)), VIOLET)).toBe(true);
    expect(document.elementFromPoint(bar.x, bar.y)?.hasAttribute('data-chart-interaction')).toBe(true);
  });

  it('opens a tooltip with the period and one row per series, top of the stack first', async () => {
    await renderChart(<Chart />);

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
    await renderChart(<Chart />);
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
      render(<Chart onRenderError={error => errors.push(error)} />);
      await expect.poll(() => screen.queryByText('The chart could not be displayed.')).toBeTruthy();
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
    const { rerender } = await renderChart(<Chart />);
    const bar = segmentCenter(1, 0);
    await expect.poll(() => near(canvasPixel(bar), VIOLET)).toBe(true);

    rerender(<Chart series={series.map(entry => (entry.key === 'a' ? { ...entry, color: 3 } : entry))} />);

    await expect.poll(() => near(canvasPixel(bar), ORANGE)).toBe(true);
  });
});

type Growth = { week: string; signups: number; returning: number; churned: number };

const growth: Growth[] = [{ week: '2026-01-05', signups: 40, returning: 22, churned: -14 }];

const growthSeries: ChartSeries<Growth>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'returning', label: 'Returning', color: 2, value: row => row.returning },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

const growthIndex = (row: Growth) => row.week;

function legendLabels() {
  return screen.queryAllByRole('listitem').map(item => item.textContent);
}

describe('BarChart legend', () => {
  it('shows a legend for two or more series', () => {
    render(
      <BarChart
        aria-label='Growth'
        data={growth}
        index={growthIndex}
        series={growthSeries}
      />,
    );

    expect(legendLabels()).toEqual(['Sign-ups', 'Returning', 'Churned']);
  });

  it('leaves the legend out for a single series unless asked', () => {
    const { rerender } = render(
      <BarChart
        aria-label='Growth'
        data={growth}
        index={growthIndex}
        series={growthSeries.slice(0, 1)}
      />,
    );
    expect(legendLabels()).toEqual([]);

    rerender(
      <BarChart
        aria-label='Growth'
        data={growth}
        index={growthIndex}
        series={growthSeries.slice(0, 1)}
        showLegend
      />,
    );
    expect(legendLabels()).toEqual(['Sign-ups']);
  });

  it('adds a labelled projection as a dashed entry', () => {
    render(
      <BarChart
        aria-label='Growth'
        data={growth}
        index={growthIndex}
        series={growthSeries.slice(0, 1)}
        projection={{ datumIndex: 0, value: 80, label: 'Projected' }}
      />,
    );

    expect(legendLabels()).toEqual(['Sign-ups', 'Projected']);
    expect(screen.getByText('Projected').querySelector('.cl-chart-swatch')).toHaveAttribute('data-swatch', 'dashed');
  });
});

describe('BarChart empty state', () => {
  it('shows the default empty state without rows', () => {
    render(
      <BarChart
        aria-label='Growth'
        data={[]}
        index={growthIndex}
        series={growthSeries}
      />,
    );

    expect(screen.getByText('No data to show')).toBeInTheDocument();
    expect(document.querySelector('.cl-chart')).toHaveAttribute('data-state', 'empty');
  });

  it('renders the caller empty state instead', () => {
    render(
      <BarChart
        aria-label='Growth'
        data={[]}
        index={growthIndex}
        series={growthSeries}
        renderEmptyState={() => <p>Connect a data source</p>}
      />,
    );

    expect(screen.getByText('Connect a data source')).toBeInTheDocument();
    expect(screen.queryByText('No data to show')).toBeNull();
  });
});
