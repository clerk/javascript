import { cleanup, render as renderComponent, screen } from '@testing-library/react';
import type {} from '@vitest/browser-playwright';
import type { ReactElement } from 'react';
import { Profiler, useRef } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';

import type { BarSelection } from '../bars/types';
import { TestChart, type TestChartProps } from './test-chart';

type Row = { period: string; value: number };

const series = [{ key: 'value', value: (row: Row) => row.value }];
const index = (row: Row) => row.period;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((period, i) => ({ period, value: (i + 1) * 10 }));

beforeAll(async () => {
  await page.viewport(1280, 900);
  const style = document.createElement('style');
  style.textContent = `
    .red { color: rgb(255, 0, 0); }
    .blue { color: rgb(0, 0, 255); }
    .series [data-series='value'], .series[data-series='value'] { color: rgb(0, 128, 0); }
    html.dark .themed { color: rgb(0, 0, 255); }
    .scheme { color-scheme: light dark; color: light-dark(rgb(255, 0, 0), rgb(0, 0, 255)); }
    .dark-scope .scoped { color: rgb(0, 0, 255); }
    html[data-brand-theme='night'] .branded { color: rgb(0, 0, 255); }
    .projected { max-width: 32px; border-radius: 4px 4px 2px 2px; color: rgb(0, 0, 255); }
    .projected[data-projection] { color: rgb(255, 0, 0); }
    .outline { fill: none; stroke: rgb(0, 0, 0); }
  `;
  document.head.append(style);
});

afterEach(() => cleanup());

async function render(element: ReactElement) {
  const view = renderComponent(element);
  await expect.poll(() => screen.queryByRole('img', { name: 'Growth' })).toBeTruthy();
  return view;
}

function Chart({ width = 600, ...props }: Partial<TestChartProps<Row>> & { width?: number }) {
  return (
    <div style={{ width }}>
      <TestChart
        data={months}
        series={series}
        index={index}
        ariaLabel='Growth'
        height={300}
        barClassName='red'
        onSelectionChange={() => {}}
        {...props}
      />
    </div>
  );
}

function surface() {
  return screen.getByRole('group', { name: 'Growth' });
}

/** The color the Canvas painted at a point given in CSS pixels relative to the canvas. */
function pixelAt(x: number, y: number) {
  const canvas = screen.getByRole('img', { name: 'Growth' });
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('The chart image is not a canvas');
  }
  const ratio = canvas.width / canvas.getBoundingClientRect().width;
  const [r, g, b, a] =
    canvas.getContext('2d')?.getImageData(Math.round(x * ratio), Math.round(y * ratio), 1, 1).data ?? [];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** A point inside the last, tallest bar, relative to the canvas. */
function insideLastBar() {
  const canvas = screen.getByRole('img', { name: 'Growth' }).getBoundingClientRect();
  const plot = surface().getBoundingClientRect();
  const step = plot.width / months.length;
  return { x: plot.right - step / 2 - canvas.left, y: plot.bottom - 4 - canvas.top };
}

function pointer(type: string, target: Element, clientX: number, clientY: number, pointerType = 'mouse') {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX, clientY, pointerType }));
}

function nextFrames(count: number) {
  return new Promise<void>(resolve => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(count);
  });
}

function centerOfCategory(categoryIndex: number) {
  const plot = surface().getBoundingClientRect();
  const step = plot.width / months.length;
  return { x: plot.left + step * (categoryIndex + 0.5), y: plot.top + plot.height / 2 };
}

describe('painting', () => {
  it('paints the bars in the computed color of Chart.Bar', async () => {
    await render(<Chart />);
    const { x, y } = insideLastBar();

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');
  });

  it('paints each series in the color its data-series state computes to', async () => {
    await render(<Chart barClassName='series' />);
    const { x, y } = insideLastBar();

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 128, 0, 255)');
  });

  it('repaints when the class of Chart.Bar changes', async () => {
    const { rerender } = await render(<Chart />);
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

    rerender(<Chart barClassName='blue' />);

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
  });

  it('repaints when the theme on <html> changes', async () => {
    await render(<Chart barClassName='red themed' />);
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

    document.documentElement.classList.add('dark');
    try {
      await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
    } finally {
      document.documentElement.classList.remove('dark');
    }
  });

  it('repaints when the theme on an ancestor element changes', async () => {
    await render(
      <div data-testid='scope'>
        <Chart barClassName='red scoped' />
      </div>,
    );
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

    screen.getByTestId('scope').classList.add('dark-scope');

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
  });

  it('repaints when a theme switches through any attribute on <html>', async () => {
    await render(<Chart barClassName='red branded' />);
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

    document.documentElement.setAttribute('data-brand-theme', 'night');
    try {
      await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
    } finally {
      document.documentElement.removeAttribute('data-brand-theme');
    }
  });

  it('repaints when the preferred color scheme changes', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    try {
      await render(<Chart barClassName='scheme' />);
      const { x, y } = insideLastBar();
      await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

      await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });

      await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('repaints at the new pixel ratio, capped at 2', async () => {
    const resolutionQueries: MediaQueryList[] = [];
    const matchMedia = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation(query => {
      const list = matchMedia(query);
      if (query.includes('resolution')) {
        resolutionQueries.push(list);
      }
      return list;
    });
    await render(<Chart />);
    const canvas = screen.getByRole('img', { name: 'Growth' });
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('The chart image is not a canvas');
    }
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');
    const cssWidth = canvas.getBoundingClientRect().width;
    expect(canvas.width).toBe(cssWidth);

    await cdp().send('Emulation.setDeviceMetricsOverride', {
      width: 0,
      height: 0,
      deviceScaleFactor: 3,
      mobile: false,
    });
    try {
      // Chromium's device emulation changes devicePixelRatio without firing the resolution query's
      // change event, so send the event that moving to another display sends.
      for (const list of [...resolutionQueries]) {
        list.dispatchEvent(new MediaQueryListEvent('change', { media: list.media, matches: list.matches }));
      }
      await expect.poll(() => canvas.width).toBe(cssWidth * 2);
      await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');
    } finally {
      await cdp().send('Emulation.clearDeviceMetricsOverride');
    }
  });

  it('paints nothing without Chart.Bar', async () => {
    await render(<Chart bar={false} />);
    const { x, y } = insideLastBar();

    await expect.poll(() => surface()).toBeTruthy();
    expect(pixelAt(x, y)).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('the projection outline', () => {
  const RADIUS = 4;
  const projection = { datumIndex: months.length - 1, value: 120 };

  function ProjectedChart({ outlineClassName = 'outline' }: { outlineClassName?: string }) {
    return (
      <div
        data-testid='projected'
        style={{ background: 'white' }}
      >
        <Chart
          width={640}
          barClassName='projected'
          outlineClassName={outlineClassName}
          projection={projection}
        />
      </div>
    );
  }

  /** The projection fill's edges in CSS pixels: the run of opaque projection color on the Canvas. */
  function projectionFill() {
    const canvas = screen.getByRole('img', { name: 'Growth' });
    const { width, height } = canvas.getBoundingClientRect();
    const red = 'rgba(255, 0, 0, 255)';
    const row = Array.from({ length: width }, (_, x) => x).filter(x => pixelAt(x, 20) === red);
    const left = Math.min(...row);
    const right = Math.max(...row) + 1;
    const column = Array.from({ length: height }, (_, y) => y).filter(
      y => pixelAt(Math.floor((left + right) / 2), y) === red,
    );
    return { left, right, top: Math.min(...column) };
  }

  /** What the screen shows at CSS pixels, by decoding a screenshot of the chart. */
  async function screenPixels() {
    const chart = screen.getByTestId('projected');
    const base64 = await page.elementLocator(chart).screenshot({ save: false });
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context?.drawImage(image, 0, 0);
    const origin = chart.getBoundingClientRect();
    const ratio = image.width / origin.width;
    const canvasBox = screen.getByRole('img', { name: 'Growth' }).getBoundingClientRect();
    return (x: number, y: number) => {
      const px = Math.floor((x + canvasBox.left - origin.left) * ratio);
      const py = Math.floor((y + canvasBox.top - origin.top) * ratio);
      const [r, g, b] = context?.getImageData(px, py, 1, 1).data ?? [];
      return `rgb(${r}, ${g}, ${b})`;
    };
  }

  /** One row of the screenshot at device-pixel resolution, as `[r, g, b]` per device pixel. */
  /** The Canvas row at CSS `y`, one entry per device pixel. */
  function canvasRow(y: number) {
    const canvas = screen.getByRole('img', { name: 'Growth' });
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('The chart image is not a canvas');
    }
    const ratio = canvas.width / canvas.getBoundingClientRect().width;
    const data = canvas.getContext('2d')?.getImageData(0, Math.floor(y * ratio), canvas.width, 1).data ?? [];
    return Array.from({ length: canvas.width }, (_, x) => Array.from(data.slice(x * 4, x * 4 + 4)).join(','));
  }

  /** The Canvas alpha at the device pixel that contains a CSS point. */
  function inkAt(x: number, y: number) {
    const canvas = screen.getByRole('img', { name: 'Growth' });
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('The chart image is not a canvas');
    }
    const ratio = canvas.width / canvas.getBoundingClientRect().width;
    return canvas.getContext('2d')?.getImageData(Math.floor(x * ratio), Math.floor(y * ratio), 1, 1).data[3] ?? 0;
  }

  const fill = 'rgb(255, 0, 0)';
  const gap = 'rgb(255, 255, 255)';
  const stroke = 'rgb(0, 0, 0)';

  it('draws a crisp 1px stroke 1px outside the fill on both sides and the top', async () => {
    await render(<ProjectedChart />);
    await expect.poll(() => pixelAt(insideLastBar().x, 20.5)).toBe('rgba(255, 0, 0, 255)');
    const { left, right, top } = projectionFill();
    const at = await screenPixels();
    const middle = top + 10.5;
    const center = (left + right) / 2;

    expect([left - 2.5, left - 1.5, left - 0.5, left + 0.5].map(x => at(x, middle))).toEqual([gap, stroke, gap, fill]);
    expect([right - 0.5, right + 0.5, right + 1.5, right + 2.5].map(x => at(x, middle))).toEqual([
      fill,
      gap,
      stroke,
      gap,
    ]);
    expect([top - 2.5, top - 1.5, top - 0.5, top + 0.5].map(y => at(center, y))).toEqual([gap, stroke, gap, fill]);
  });

  it('leaves the same crisp gap on both sides at fractional pixel ratios', async () => {
    const uneven: string[] = [];
    try {
      for (const deviceScaleFactor of [1.1, 1.25, 1.5, 1.8, 2]) {
        await cdp().send('Emulation.setDeviceMetricsOverride', {
          width: 1280,
          height: 900,
          deviceScaleFactor,
          mobile: false,
        });
        await render(<ProjectedChart />);
        await expect.poll(() => pixelAt(insideLastBar().x, 20.5)).toBe('rgba(255, 0, 0, 255)');
        // Rounding in the Canvas transform can leave a 1/255 sliver, so a pixel is classed by coverage.
        const kinds = canvasRow(projectionFill().top + 10.5).map(pixel => {
          const [r, g, , a] = pixel.split(',').map(Number);
          if ((a ?? 0) < 16) {
            return 'gap';
          }
          if ((a ?? 0) > 240) {
            return r === 255 && g === 0 ? 'fill' : 'stroke';
          }
          return 'blur';
        });
        const first = kinds.indexOf('fill');
        const last = kinds.lastIndexOf('fill');
        const side = (pixels: string[]) =>
          pixels
            .join(' ')
            .replace(/(\w+)( \1)*/g, (run, kind: string) => `${kind}×${run.split(' ').length}`)
            .split(' ')
            .slice(0, 2)
            .join(' ');
        const left = side(kinds.slice(0, first).reverse());
        const right = side(kinds.slice(last + 1));
        if (left !== right || !left.startsWith('gap×') || !left.includes('stroke×')) {
          uneven.push(`${deviceScaleFactor}x: left ${left}, right ${right}`);
        }
        cleanup();
      }
    } finally {
      await cdp().send('Emulation.clearDeviceMetricsOverride');
    }

    expect(uneven).toEqual([]);
  });

  it('keeps the top corners concentric with the fill', async () => {
    await render(<ProjectedChart />);
    await expect.poll(() => pixelAt(insideLastBar().x, 20.5)).toBe('rgba(255, 0, 0, 255)');
    const { left, right, top } = projectionFill();
    const distance = RADIUS + 1.5;
    const missed: string[] = [];
    for (let degrees = 0; degrees <= 90; degrees += 15) {
      const angle = (degrees * Math.PI) / 180;
      const dx = distance * Math.cos(angle);
      const dy = distance * Math.sin(angle);
      for (const [x, y] of [
        [left + RADIUS - dx, top + RADIUS - dy],
        [right - RADIUS + dx, top + RADIUS - dy],
      ]) {
        if (inkAt(x, y) === 0) {
          missed.push(`${degrees}deg (${x.toFixed(2)}, ${y.toFixed(2)})`);
        }
      }
    }

    expect(missed).toEqual([]);
  });

  it('meets the zero line with square bottom corners', async () => {
    await render(<ProjectedChart />);
    await expect.poll(() => pixelAt(insideLastBar().x, 20.5)).toBe('rgba(255, 0, 0, 255)');
    const { left, right } = projectionFill();
    const zero = Number(document.querySelector('line')?.getAttribute('y1'));

    expect([inkAt(left - 1.5, zero - 1), inkAt(right + 1.5, zero - 1)]).toEqual([255, 255]);
    expect([inkAt(left - 1.5, zero + 1), inkAt(right + 1.5, zero + 1)]).toEqual([0, 0]);
  });
});

describe('resizing', () => {
  it('follows its container and keeps painting the full width', async () => {
    const { rerender } = await render(<Chart width={600} />);
    await expect.poll(() => surface().getBoundingClientRect().width).toBeGreaterThan(0);
    const before = surface().getBoundingClientRect().width;

    rerender(<Chart width={900} />);

    await expect.poll(() => surface().getBoundingClientRect().width).toBe(before + 300);
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');
  });
});

describe('choosing a period with a pointer', () => {
  it('selects the period under a mouse and clears it when the mouse leaves', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(<Chart onSelectionChange={onSelectionChange} />);
    const { x, y } = centerOfCategory(3);

    const plot = surface().getBoundingClientRect();
    await userEvent.hover(surface(), { position: { x: x - plot.left, y: y - plot.top } });
    await expect
      .poll(() => onSelectionChange.mock.lastCall?.[0])
      .toMatchObject({ category: 'Apr', section: 'positive' });
    const cursor = screen.getByTestId('cursor').getBoundingClientRect();
    expect(cursor.left).toBeLessThan(x);
    expect(cursor.right).toBeGreaterThan(x);

    await userEvent.unhover(surface());
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toBeNull();
    expect(screen.queryByTestId('cursor')).toBeNull();
  });

  it('does not rerender while the mouse moves within the selected period', async () => {
    let commits = 0;
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(
      <Profiler
        id='chart'
        onRender={() => {
          commits++;
        }}
      >
        <Chart onSelectionChange={onSelectionChange} />
      </Profiler>,
    );
    const { x, y } = centerOfCategory(3);
    pointer('pointermove', surface(), x, y);
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Apr' });
    await nextFrames(3);
    const settled = commits;

    for (const dx of [-6, -3, 3, 6]) {
      pointer('pointermove', surface(), x + dx, y + dx);
      await nextFrames(1);
    }
    await nextFrames(2);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(commits).toBe(settled);
  });

  it('selects on touch contact, keeps it after the finger lifts, and dismisses on a touch elsewhere', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(<Chart onSelectionChange={onSelectionChange} />);
    const { x } = centerOfCategory(1);

    pointer('pointerdown', surface(), x, surface().getBoundingClientRect().bottom - 4, 'touch');
    surface().dispatchEvent(
      new PointerEvent('pointerout', { bubbles: true, pointerType: 'touch', relatedTarget: document.body }),
    );
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Feb' });

    pointer('pointerdown', document.body, 0, 0, 'touch');
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toBeNull();
  });

  it('selects the column under the mouse anywhere in the plot, above a short bar too', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(
      <Chart
        onSelectionChange={onSelectionChange}
        renderTooltip={active => active.category}
      />,
    );
    const plot = surface().getBoundingClientRect();
    await userEvent.hover(surface(), { position: { x: centerOfCategory(5).x - plot.left, y: plot.height - 4 } });
    await expect.poll(() => screen.queryByTestId('tooltip')).toHaveTextContent('Jun');

    await userEvent.hover(surface(), { position: { x: centerOfCategory(0).x - plot.left, y: 4 } });
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Jan' });
    await expect.poll(() => screen.queryByTestId('tooltip')).toHaveTextContent('Jan');
    await userEvent.unhover(surface());
  });

  it('moves a touch selection to the column tapped, above its bar too', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(<Chart onSelectionChange={onSelectionChange} />);
    const plot = surface().getBoundingClientRect();

    pointer('pointerdown', surface(), centerOfCategory(5).x, plot.bottom - 4, 'touch');
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Jun' });

    pointer('pointerdown', surface(), centerOfCategory(0).x, plot.top + 4, 'touch');
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Jan' });
  });

  it('selects the section on the same side of the zero line as the pointer, past the bars too', async () => {
    type Signed = { period: string; gained: number; lost: number };
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(
      <div style={{ width: 600 }}>
        <TestChart
          data={[
            { period: 'Jan', gained: 10, lost: -10 },
            { period: 'Feb', gained: 100, lost: -100 },
          ]}
          series={[
            { key: 'gained', value: (row: Signed) => row.gained },
            { key: 'lost', value: (row: Signed) => row.lost },
          ]}
          index={(row: Signed) => row.period}
          ariaLabel='Growth'
          height={300}
          barClassName='red'
          onSelectionChange={onSelectionChange}
        />
      </div>,
    );
    const plot = surface().getBoundingClientRect();
    const jan = plot.left + plot.width / 4;

    pointer('pointermove', surface(), jan, plot.top + 4);
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toEqual({ category: 'Jan', section: 'positive' });
    pointer('pointermove', surface(), jan, plot.bottom - 4);
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toEqual({ category: 'Jan', section: 'negative' });
  });
});

function BoundedChart({ width, chartWidth }: { width: number; chartWidth: number }) {
  const boundary = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={boundary}
      data-testid='boundary'
      style={{ width, marginLeft: 40 }}
    >
      <Chart
        width={chartWidth}
        boundary={boundary}
        renderTooltip={active => (
          <div style={{ width: 200, height: 80 }}>
            {active.category}: {active.datum.value}
          </div>
        )}
      />
    </div>
  );
}

async function focusPeriod(presses: number) {
  surface().focus();
  for (let i = 0; i < presses; i++) {
    await userEvent.keyboard('{ArrowRight}');
  }
  await expect.poll(() => screen.queryByTestId('tooltip')?.style.visibility).toBe('');
  return screen.getByTestId('tooltip');
}

function contains(outer: DOMRect, inner: DOMRect) {
  return inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top;
}

describe('the tooltip', () => {
  it('stays closed for a period whose content is null', async () => {
    await render(<Chart renderTooltip={active => (active.category === 'Feb' ? null : active.category)} />);
    await focusPeriod(0);
    expect(screen.getByTestId('tooltip')).toHaveTextContent('Jan');

    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => screen.queryByTestId('tooltip')).toBeNull();
  });

  it('opens on `side` at `sideOffset` from the period', async () => {
    await render(
      <Chart
        width={800}
        renderTooltip={active => <div style={{ width: 120 }}>{active.category}</div>}
        tooltip={{ side: 'left', sideOffset: 24 }}
      />,
    );
    const plot = surface().getBoundingClientRect();
    await userEvent.hover(surface(), { position: { x: centerOfCategory(3).x - plot.left, y: plot.height - 4 } });
    await expect.poll(() => screen.queryByTestId('tooltip')?.style.visibility).toBe('');

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-side', 'left');
    expect(centerOfCategory(3).x - tooltip.getBoundingClientRect().right).toBeCloseTo(24, 0);
  });

  it('opens beside the selected period and shows its content', async () => {
    await render(
      <BoundedChart
        width={800}
        chartWidth={800}
      />,
    );
    await focusPeriod(1);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveTextContent('Feb: 20');
    expect(tooltip).toHaveAttribute('data-side', 'right');
    expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(centerOfCategory(1).x);
  });

  it('moves to the left of a period near the right edge and stays inside the boundary', async () => {
    await render(
      <BoundedChart
        width={800}
        chartWidth={800}
      />,
    );
    await focusPeriod(5);

    const tooltip = screen.getByTestId('tooltip');
    await expect.poll(() => tooltip.getAttribute('data-side')).toBe('left');
    expect(tooltip.getBoundingClientRect().right).toBeLessThan(centerOfCategory(5).x);
    expect(contains(screen.getByTestId('boundary').getBoundingClientRect(), tooltip.getBoundingClientRect())).toBe(
      true,
    );
  });

  it('pins to the top of the boundary on a narrow plot', async () => {
    await render(
      <BoundedChart
        width={380}
        chartWidth={380}
      />,
    );
    await focusPeriod(2);

    const boundary = screen.getByTestId('boundary').getBoundingClientRect();
    const tooltip = screen.getByTestId('tooltip').getBoundingClientRect();
    expect(tooltip.left).toBe(boundary.left + 8);
    expect(tooltip.top).toBe(boundary.top + 8);
    expect(contains(boundary, tooltip)).toBe(true);
  });

  it('marks the tooltip as moving from the first change of period until it closes', async () => {
    await render(
      <BoundedChart
        width={800}
        chartWidth={800}
      />,
    );
    const tooltip = await focusPeriod(0);
    expect(tooltip).toHaveTextContent('Jan: 10');
    expect(tooltip).not.toHaveAttribute('data-moving');

    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => tooltip.textContent).toBe('Feb: 20');
    expect(tooltip).toHaveAttribute('data-moving');

    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(() => tooltip.textContent).toBe('Jan: 10');
    expect(tooltip).toHaveAttribute('data-moving');

    surface().blur();
    await expect.poll(() => screen.queryByTestId('tooltip')).toBeNull();
    const reopened = await focusPeriod(0);
    expect(reopened).not.toHaveAttribute('data-moving');
  });

  it('hides the tooltip while its chart is scrolled out of view and shows it again once it is back', async () => {
    await render(
      <div
        data-testid='scroller'
        style={{ height: 300, overflow: 'auto' }}
      >
        <BoundedChart
          width={800}
          chartWidth={800}
        />
        <div style={{ height: 2000 }} />
      </div>,
    );
    const tooltip = await focusPeriod(1);
    expect(tooltip).not.toHaveAttribute('data-anchor-hidden');

    const scroller = screen.getByTestId('scroller');
    scroller.scrollTop = 1000;
    await expect.poll(() => tooltip.hasAttribute('data-anchor-hidden')).toBe(true);
    expect(tooltip.style.visibility).toBe('hidden');

    scroller.scrollTop = 0;
    await expect.poll(() => tooltip.hasAttribute('data-anchor-hidden')).toBe(false);
    expect(tooltip.style.visibility).toBe('');
  });

  it('closes when the selection is dismissed', async () => {
    await render(
      <BoundedChart
        width={800}
        chartWidth={800}
      />,
    );
    await focusPeriod(1);

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => screen.queryByTestId('tooltip')).toBeNull();
  });
});

function activeTicks() {
  return [...document.querySelectorAll('text[data-active]')].map(tick => tick.textContent);
}

describe('removing Chart.Selection', () => {
  it('ends a keyboard selection', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    const { rerender } = await render(<Chart onSelectionChange={onSelectionChange} />);
    surface().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(activeTicks).toEqual(['Feb']);

    rerender(
      <Chart
        onSelectionChange={onSelectionChange}
        selectionPart={false}
      />,
    );

    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toBeNull();
    expect(activeTicks()).toEqual([]);
  });

  it('ends a pointer selection', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    const { rerender } = await render(<Chart onSelectionChange={onSelectionChange} />);
    const { x, y } = centerOfCategory(3);
    pointer('pointermove', surface(), x, y);
    await expect.poll(activeTicks).toEqual(['Apr']);

    rerender(
      <Chart
        onSelectionChange={onSelectionChange}
        selectionPart={false}
      />,
    );

    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toBeNull();
    expect(activeTicks()).toEqual([]);
  });

  it('keeps a selection the consumer set', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    const selection: BarSelection = { category: 'Mar', section: 'positive' };
    const { rerender } = await render(
      <Chart
        selection={selection}
        onSelectionChange={onSelectionChange}
      />,
    );
    await expect.poll(activeTicks).toEqual(['Mar']);

    rerender(
      <Chart
        selection={selection}
        onSelectionChange={onSelectionChange}
        selectionPart={false}
      />,
    );

    expect(activeTicks()).toEqual(['Mar']);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
