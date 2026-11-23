import { cleanup, render as renderComponent, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useRef } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { BarSelection } from '../types';
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

function centerOfCategory(categoryIndex: number) {
  const plot = surface().getBoundingClientRect();
  const step = plot.width / months.length;
  return { x: plot.left + step * (categoryIndex + 0.5), y: plot.top + plot.height / 2 };
}

describe('painting', () => {
  it('paints the bars in the computed color of BarChart.Bar', async () => {
    await render(<Chart />);
    const { x, y } = insideLastBar();

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');
  });

  it('paints each series in the color its data-series state computes to', async () => {
    await render(<Chart barClassName='series' />);
    const { x, y } = insideLastBar();

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 128, 0, 255)');
  });

  it('repaints when the class of BarChart.Bar changes', async () => {
    const { rerender } = await render(<Chart />);
    const { x, y } = insideLastBar();
    await expect.poll(() => pixelAt(x, y)).toBe('rgba(255, 0, 0, 255)');

    rerender(<Chart barClassName='blue' />);

    await expect.poll(() => pixelAt(x, y)).toBe('rgba(0, 0, 255, 255)');
  });

  it('paints nothing without BarChart.Bar', async () => {
    await render(<Chart bar={false} />);
    const { x, y } = insideLastBar();

    await expect.poll(() => surface()).toBeTruthy();
    expect(pixelAt(x, y)).toBe('rgba(0, 0, 0, 0)');
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

  it('selects on touch contact, keeps it after the finger lifts, and dismisses on a touch elsewhere', async () => {
    const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
    await render(<Chart onSelectionChange={onSelectionChange} />);
    const { x, y } = centerOfCategory(1);

    pointer('pointerdown', surface(), x, y, 'touch');
    surface().dispatchEvent(
      new PointerEvent('pointerout', { bubbles: true, pointerType: 'touch', relatedTarget: document.body }),
    );
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toMatchObject({ category: 'Feb' });

    pointer('pointerdown', document.body, 0, 0, 'touch');
    await expect.poll(() => onSelectionChange.mock.lastCall?.[0]).toBeNull();
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
