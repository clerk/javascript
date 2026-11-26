type CalendarTick = Readonly<{ label: string; coordinate: number }>;

type CalendarAxis = Readonly<{
  timestamps: readonly number[];
  /** The center of the category at each timestamp. */
  centers: readonly number[];
  plot: { x: number; width: number };
  viewportWidth: number;
  measure: (label: string) => number;
}>;

const day = 24 * 60 * 60 * 1000;
const monthSteps = [1, 3, 6, 12, 24, 60, 120];
const monthLabel = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function parseCalendarDates(indexes: readonly string[]): number[] | null {
  const timestamps = indexes.map(Date.parse);
  if (
    timestamps.some(
      (timestamp, index) =>
        !Number.isFinite(timestamp) || (index > 0 && timestamp < (timestamps[index - 1] ?? timestamp)),
    )
  ) {
    return null;
  }
  return timestamps;
}

function coordinateAt(timestamp: number, timestamps: readonly number[], centers: readonly number[]): number {
  let low = 0;
  let high = timestamps.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if ((timestamps[middle] ?? Infinity) < timestamp) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const right = Math.min(low, timestamps.length - 1);
  const left = Math.max(0, right - 1);
  const leftDate = timestamps[left] ?? timestamp;
  const rightDate = timestamps[right] ?? timestamp;
  const leftCenter = centers[left] ?? 0;
  const rightCenter = centers[right] ?? leftCenter;
  if (rightDate === leftDate) {
    return rightCenter;
  }
  return leftCenter + ((timestamp - leftDate) / (rightDate - leftDate)) * (rightCenter - leftCenter);
}

function monthBoundaries(first: number, last: number, step: number): Date[] {
  const start = new Date(first);
  const firstMonth = start.getUTCFullYear() * 12 + start.getUTCMonth();
  const result: Date[] = [];
  for (let month = Math.ceil(firstMonth / step) * step; ; month += step) {
    const date = new Date(Date.UTC(Math.floor(month / 12), month % 12, 1));
    if (date.getTime() > last) {
      break;
    }
    if (date.getTime() >= first) {
      result.push(date);
    }
  }
  return result;
}

export function selectCalendarTicks({
  timestamps,
  centers,
  plot,
  viewportWidth,
  measure,
}: CalendarAxis): CalendarTick[] {
  const first = timestamps[0];
  const last = timestamps[timestamps.length - 1];
  if (first === undefined || last === undefined || last - first < 90 * day || plot.width <= 0) {
    return [];
  }

  for (const step of monthSteps) {
    const ticks = monthBoundaries(first, last, step)
      .map(date => ({
        label: monthLabel.format(date),
        coordinate: coordinateAt(date.getTime(), timestamps, centers),
      }))
      .filter(tick => {
        const halfWidth = measure(tick.label) / 2;
        return tick.coordinate - halfWidth >= 0 && tick.coordinate + halfWidth <= viewportWidth;
      });
    if (
      ticks.length > 0 &&
      ticks.every(
        (tick, index) =>
          index === 0 ||
          tick.coordinate - (ticks[index - 1]?.coordinate ?? 0) >=
            (measure(tick.label) + measure(ticks[index - 1]?.label ?? '')) / 2 + 20,
      )
    ) {
      return ticks;
    }
  }
  return [];
}
