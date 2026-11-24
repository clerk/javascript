import { act, render as renderComponent } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

import type { BarChartInstance } from '..';
import type { BarSelection } from '../bars/types';
import { TestChart, type TestChartProps } from './test-chart';

/** Every observed element reports a 600x300 box when `render` flushes it; happy-dom has no layout. */
const observed: (() => void)[] = [];

class TestResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    const entry = { target, borderBoxSize: [{ inlineSize: 600, blockSize: 300 }] };
    // eslint-disable-next-line typescript/consistent-type-assertions -- A stub entry carries only the fields the chart reads.
    observed.push(() => this.callback([entry as unknown as ResizeObserverEntry], this));
  }
  unobserve() {}
  disconnect() {}
}

export function render(element: ReactElement) {
  const view = renderComponent(element);
  act(() => observed.splice(0).forEach(report => report()));
  return view;
}

export type ChartRow = { period: string; value: number };

export const chartFixture = {
  data: [{ period: 'Jan', value: 10 }],
  series: [{ key: 'value', value: (row: ChartRow) => row.value }],
  index: (row: ChartRow) => row.period,
  ariaLabel: 'Growth',
} satisfies TestChartProps<ChartRow>;

/**
 * Renders the chart with a one-series fixture. Pass `data`, `series` and `index` together to use
 * another row shape. `active()` returns the chart's selected bar.
 */
export function renderChart<TDatum = ChartRow>(props: Partial<TestChartProps<TDatum>> = {}) {
  // eslint-disable-next-line typescript/consistent-type-assertions -- Callers that change the row type pass their own data, series and index.
  const base = chartFixture as unknown as TestChartProps<TDatum>;
  const onSelectionChange = vi.fn<(selection: BarSelection | null) => void>();
  const chartRef: { current: BarChartInstance<TDatum> | null } = { current: null };
  const chartProps = { ...base, onSelectionChange, chartRef, ...props };
  const view = render(<TestChart {...chartProps} />);
  const name = chartProps.ariaLabel;
  const interaction = view.queryByRole('button', { name }) ?? view.getByRole('group', { name });
  return {
    ...view,
    interaction,
    active: () => chartRef.current?.selected ?? null,
    rerenderChart: (next: Partial<TestChartProps<TDatum>>) =>
      view.rerender(
        <TestChart
          {...chartProps}
          {...next}
        />,
      ),
  };
}

type GrowthRow = { period: string; gained: number; lost: number };

export const growthChart = {
  series: [
    { key: 'gained', value: (row: GrowthRow) => row.gained },
    { key: 'lost', value: (row: GrowthRow) => row.lost },
  ],
  index: (row: GrowthRow) => row.period,
};

export const quarter = [
  { period: 'Jan', value: 10 },
  { period: 'Feb', value: 20 },
  { period: 'Mar', value: 30 },
];

const context = {
  save: vi.fn(),
  restore: vi.fn(),
  clip: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
  rect: vi.fn(),
  roundRect: vi.fn(),
  setTransform: vi.fn(),
  moveTo: vi.fn(),
  arcTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  strokeStyle: '',
  lineWidth: 1,
};

/** Fakes what happy-dom lacks for the chart to mount: a measured size and a 2D context. */
export function setupChart() {
  observed.length = 0;
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  // eslint-disable-next-line typescript/consistent-type-assertions -- happy-dom has no 2D context; the stub records nothing the tests read.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
}
