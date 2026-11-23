import { describe, expect, it } from 'vitest';

import { selectCalendarTicks } from '../calendar-ticks';
import { selectXTicks } from '../x-ticks';

const day = 24 * 60 * 60 * 1000;
const labelWidth = 64;
const dates = (count: number, start = Date.UTC(2020, 0, 14)) =>
  Array.from({ length: count }, (_, index) => start + index * day);
const isoDates = (timestamps: readonly number[]) =>
  timestamps.map(timestamp => new Date(timestamp).toISOString().slice(0, 10));
const axis = (timestamps: readonly number[], width: number) =>
  selectCalendarTicks({
    timestamps,
    plot: { x: 76, width: width - 92 },
    viewportWidth: width,
    measure: () => labelWidth,
  });

describe('calendar boundaries', () => {
  it('labels year boundaries with their year on a multi-year daily chart', () => {
    const ticks = axis(dates(2200), 722);

    expect(ticks.map(tick => tick.label)).toEqual(expect.arrayContaining(['Jan 2021', 'Jan 2025']));
    for (const tick of ticks) {
      expect(tick.label).toMatch(/^Jan \d{4}$/);
      expect(tick.coordinate - labelWidth / 2).toBeGreaterThanOrEqual(0);
      expect(tick.coordinate + labelWidth / 2).toBeLessThanOrEqual(722);
    }
  });

  it('labels a month that has no bar of its own, in date order', () => {
    const ticks = axis(
      [Date.UTC(2024, 0, 1), Date.UTC(2024, 0, 15), Date.UTC(2024, 2, 1), Date.UTC(2024, 3, 1), Date.UTC(2024, 4, 1)],
      1000,
    );

    expect(ticks.map(tick => tick.label)).toContain('Feb 2024');
    const coordinates = ticks.map(tick => tick.coordinate);
    expect(coordinates).toEqual([...coordinates].sort((a, b) => a - b));
  });

  it('gives narrower charts fewer labels that never overlap', () => {
    const axes = [450, 722, 1200].map(width => axis(dates(2200), width));
    const counts = axes.map(ticks => ticks.length);

    expect(counts[0]).toBeLessThan(counts[2] ?? 0);
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
    for (const ticks of axes) {
      ticks.slice(1).forEach((tick, index) => {
        const previous = ticks[index]?.coordinate ?? -Infinity;
        expect(tick.coordinate - previous).toBeGreaterThan(labelWidth);
      });
    }
  });
});

describe('category fallback', () => {
  it.each([
    { name: 'a short range', keys: isoDates(dates(7)) },
    {
      name: 'an invalid date',
      keys: ['2024-01-01', 'not a date', '2024-06-01'],
    },
    {
      name: 'unordered dates',
      keys: ['2024-06-01', '2024-01-01', '2024-09-01'],
    },
  ])('labels categories for $name', ({ keys }) => {
    const plot = { x: 0, width: 600 };
    const step = plot.width / keys.length;
    const ticks = selectXTicks({
      categories: keys.map((key, index) => ({
        key,
        center: index * step + step / 2,
      })),
      plot,
      viewportWidth: 600,
      xAxis: 'calendar',
      formatXTick: label => label,
    });

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick.category).toBe(tick.label);
    }
  });

  it('keeps calendar labels when a date repeats', () => {
    const timestamps = dates(200);
    const keys = isoDates([timestamps[0] ?? 0, ...timestamps]);
    const plot = { x: 0, width: 600 };
    const ticks = selectXTicks({
      categories: keys.map((key, index) => ({ key, center: index })),
      plot,
      viewportWidth: 600,
      xAxis: 'calendar',
      formatXTick: label => label,
    });

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick.category).toBeNull();
    }
  });
});
