import { describe, expect, it } from 'vitest';

import { selectXTicks, type XTick } from '../x-ticks';

type Plot = { x: number; width: number };

const plot = { x: 0, width: 600 };
const gutteredPlot = { x: 64, width: 480 };
const measureByLength = (label: string) => label.length * 8;

function categories(keys: readonly string[], area: Plot = plot) {
  const step = area.width / keys.length;
  return keys.map((key, datumIndex) => ({
    key,
    center: area.x + datumIndex * step + step / 2,
  }));
}

function dailyDates(count: number, start: number) {
  return Array.from({ length: count }, (_, index) =>
    new Date(start + index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
}

function extent(tick: XTick, measure: (label: string) => number) {
  const width = measure(tick.label);
  const left = tick.textAnchor === 'start' ? tick.x : tick.textAnchor === 'end' ? tick.x - width : tick.x - width / 2;
  return { left, right: left + width };
}

function expectReadable(ticks: readonly XTick[], area: Plot, measure: (label: string) => number) {
  const extents = ticks.map(tick => extent(tick, measure));
  extents.forEach((current, index) => {
    expect(current.left).toBeGreaterThanOrEqual(area.x);
    expect(current.right).toBeLessThanOrEqual(area.x + area.width);
    const previous = extents[index - 1];
    if (previous) {
      expect(current.left).toBeGreaterThan(previous.right);
    }
  });
}

describe('category labels', () => {
  it.each([
    { name: 'short labels', width: 20, labels: ['Jan', 'Feb', 'Mar'] },
    { name: 'wide labels', width: 260, labels: ['Jan', 'Mar'] },
  ])('labels the first and last periods without overlap for $name', ({ width, labels }) => {
    const measure = () => width;
    const ticks = selectXTicks({
      categories: categories(['Jan', 'Feb', 'Mar']),
      plot,
      viewportWidth: 600,
      formatXTick: label => label,
      measure,
    });

    expect(ticks.map(tick => tick.label)).toEqual(labels);
    expectReadable(ticks, plot, measure);
  });

  it('omits a null label without hiding the other labels', () => {
    const ticks = selectXTicks({
      categories: categories(['Jan', 'Feb', 'Mar', 'Apr', 'May']),
      plot,
      viewportWidth: 600,
      formatXTick: label => (label === 'Mar' ? null : label),
      measure: () => 20,
    });

    expect(ticks.map(tick => tick.label)).toEqual(['Jan', 'Feb', 'Apr', 'May']);
  });

  it('thins dense periods and keeps the first and latest', () => {
    const wide = { x: 0, width: 960 };
    const keys = Array.from({ length: 30 }, (_, position) => String(position));
    const measure = () => 30;
    const ticks = selectXTicks({
      categories: categories(keys, wide),
      plot: wide,
      viewportWidth: 960,
      formatXTick: label => label,
      measure,
    });

    expect(ticks.length).toBeLessThan(keys.length);
    expect(ticks[0]?.label).toBe('0');
    expect(ticks.at(-1)?.label).toBe('29');
    expectReadable(ticks, wide, measure);
  });
});

describe('calendar labels', () => {
  it.each([
    {
      name: 'a range starting on a month boundary',
      days: dailyDates(365, Date.UTC(2025, 6, 1)),
    },
    {
      name: 'a range starting mid-month',
      days: dailyDates(124, Date.UTC(2025, 6, 14)),
    },
    {
      name: 'a range ending just after a month boundary',
      days: dailyDates(379, Date.UTC(2025, 6, 1)),
    },
  ])('labels month boundaries inside the plot for $name', ({ days }) => {
    const ticks = selectXTicks({
      categories: categories(days, gutteredPlot),
      plot: gutteredPlot,
      viewportWidth: 560,
      xAxis: 'calendar',
      formatXTick: () => null,
      measure: measureByLength,
    });

    expect(ticks.length).toBeGreaterThan(1);
    for (const tick of ticks) {
      expect(tick.label).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
      expect(tick.category).toBeNull();
    }
    expectReadable(ticks, gutteredPlot, measureByLength);
  });
});
