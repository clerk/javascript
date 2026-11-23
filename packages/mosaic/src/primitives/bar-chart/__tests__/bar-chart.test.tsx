import { cleanup, fireEvent, render as renderComponent, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RenderProps } from '../../utils';
import { BarChart, type BarSelection } from '../index';
import { chartFixture, type ChartRow, growthChart, quarter, render, renderChart, setupChart } from './fixtures';
import { TestChart } from './test-chart';

beforeEach(setupChart);
afterEach(cleanup);

function StackedChart({
  data = chartFixture.data,
  render: renderProp,
  children,
}: {
  data?: readonly ChartRow[];
  render?: React.ComponentProps<typeof BarChart.Root>['render'];
  children?: React.ReactNode;
}) {
  const chart = BarChart.useBarChart({ data, series: chartFixture.series, index: chartFixture.index });
  return (
    <BarChart.Root
      chart={chart}
      aria-label='Growth'
      render={renderProp}
    >
      {children}
    </BarChart.Root>
  );
}

function chartRoot(container: HTMLElement) {
  const root = container.firstElementChild;
  if (!root) {
    throw new Error('Missing chart root');
  }
  return root;
}

describe('composing parts', () => {
  it.each([
    ['Grid', <BarChart.Grid key='grid' />],
    ['StackedBars', <BarChart.StackedBars key='bars' />],
    ['BarSelection', <BarChart.BarSelection key='selection' />],
  ])('throws when BarChart.%s is used outside BarChart.Root', (part, element) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderComponent(element)).toThrow(`<BarChart.${part}> must be used within <BarChart.Root>`);
  });

  it.each([
    ['Cursor', <BarChart.Cursor key='cursor' />],
    ['Tooltip', <BarChart.Tooltip key='tooltip'>{() => 'Growth'}</BarChart.Tooltip>],
  ])('throws when BarChart.%s is used outside BarChart.BarSelection', (part, element) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<StackedChart>{element}</StackedChart>)).toThrow(
      `<BarChart.${part}> must be used within <BarChart.BarSelection>`,
    );
  });

  it('throws when BarChart.Bar is used outside BarChart.StackedBars', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <StackedChart>
          <BarChart.Bar />
        </StackedChart>,
      ),
    ).toThrow('<BarChart.Bar> must be used within <BarChart.StackedBars>');
  });

  it.each([
    ['an element', <section key='element' />],
    ['a function', (props: RenderProps) => <section {...props} />],
  ])('renders a part as %s passed to render', (_, renderElement) => {
    const { container } = render(
      <StackedChart render={renderElement}>
        <BarChart.StackedBars />
      </StackedChart>,
    );

    const root = chartRoot(container);
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-chart-interaction-mode', 'visual-only');
    expect(root).toContainElement(screen.getByRole('img', { name: 'Growth' }));
  });

  it('exposes the bars as the one labelled chart image', () => {
    renderChart();

    expect(screen.getAllByRole('img').map(image => image.getAttribute('aria-label'))).toEqual(['Growth']);
  });

  it('is interactive with BarChart.BarSelection and categories', () => {
    const { container, rerender } = render(
      <StackedChart>
        <BarChart.StackedBars />
        <BarChart.BarSelection />
      </StackedChart>,
    );

    expect(chartRoot(container)).toHaveAttribute('data-chart-interaction-mode', 'interactive');
    expect(screen.getByRole('group')).toBeInTheDocument();

    rerender(
      <StackedChart data={[]}>
        <BarChart.StackedBars />
        <BarChart.BarSelection />
      </StackedChart>,
    );
    expect(chartRoot(container)).toHaveAttribute('data-chart-interaction-mode', 'visual-only');
    expect(screen.queryByRole('group')).toBeNull();
  });
});

const twoSided = [{ period: 'Jan', gained: 12, lost: -4 }];

function press(target: Element, ...keys: string[]) {
  fireEvent.focus(target);
  keys.forEach(key => fireEvent.keyDown(target, { key }));
}

describe('choosing a period', () => {
  it('keeps dense data selectable until bar selection is turned off', () => {
    const data = Array.from({ length: 2200 }, (_, period) => ({
      period: String(period),
      value: period + 1,
    }));
    const { container, queryByRole, rerenderChart } = renderChart({
      data,
      projection: { datumIndex: 2199, value: 2300 },
    });
    const mode = () => container.firstElementChild?.getAttribute('data-chart-interaction-mode');

    expect(mode()).toBe('interactive');
    rerenderChart({ barSelection: false });
    expect(queryByRole('group', { name: 'Growth' })).toBeNull();
    expect(mode()).toBe('visual-only');
  });
});

describe('choosing a period with the keyboard', () => {
  it('is a focusable group, not a button or an image', () => {
    const { getByRole } = renderChart({ data: quarter });
    const group = getByRole('group', { name: 'Growth' });
    expect(group).toHaveAttribute('tabindex', '0');
    expect(getByRole('img', { name: 'Growth' })).not.toContainElement(group);
  });

  it.each([
    { keys: [], selection: { category: 'Jan', section: 'positive' } },
    { keys: ['ArrowRight'], selection: { category: 'Feb', datumIndex: 1 } },
    { keys: ['End'], selection: { category: 'Mar' } },
    { keys: ['End', 'Home'], selection: { category: 'Jan' } },
    { keys: ['End', 'ArrowLeft'], selection: { category: 'Feb' } },
    {
      keys: ['ArrowRight', 'Escape', 'ArrowRight'],
      selection: { category: 'Mar' },
    },
    { keys: ['End', 'Escape'], selection: null },
  ])('selects $selection after $keys', ({ keys, selection }) => {
    const { interaction, active } = renderChart({ data: quarter });
    press(interaction, ...keys);
    if (selection) {
      expect(active()).toMatchObject(selection);
    } else {
      expect(active()).toBeNull();
    }
  });

  it.each([
    { keys: ['ArrowDown'], section: 'negative' },
    { keys: ['ArrowDown', 'ArrowUp'], section: 'positive' },
  ])('selects the $section section after $keys', ({ keys, section }) => {
    const { interaction, active } = renderChart({
      ...growthChart,
      data: twoSided,
    });
    press(interaction, ...keys);
    expect(active()).toMatchObject({ datumIndex: 0, section });
  });

  it.each([
    {
      name: 'the selected period and section',
      props: { data: quarter },
      keys: ['ArrowRight'],
      announcement: 'Feb, positive values',
    },
    {
      name: 'the formatted period name',
      props: {
        data: quarter,
        formatXTick: (period: string) => `${period} 2026`,
      },
      keys: [],
      announcement: 'Jan 2026, positive values',
    },
    {
      name: 'a period that has no values',
      props: {
        data: [
          { period: 'Jan', value: 10 },
          { period: 'Feb', value: 0 },
        ],
      },
      keys: ['ArrowRight'],
      announcement: 'No values for this period',
    },
  ])('announces $name', ({ props, keys, announcement }) => {
    const { interaction, getByRole } = renderChart(props);
    press(interaction, ...keys);
    expect(getByRole('status')).toHaveTextContent(announcement);
  });
});

describe('activating a period', () => {
  it.each([
    { name: 'Enter', props: { data: quarter }, keys: ['ArrowRight', 'Enter'] },
    {
      name: 'Enter when the consumer only handles clicks',
      props: { data: quarter, onSelectionChange: undefined },
      keys: ['ArrowRight', 'Enter'],
    },
    {
      name: 'an assistive technology click without coordinates',
      props: { data: quarter },
      keys: ['ArrowRight'],
      click: true,
    },
  ])('opens the selected period with $name', ({ props, keys, click }) => {
    const onActivate = vi.fn();
    const { interaction } = renderChart({ ...props, onActivate });
    press(interaction, ...keys);
    if (click) {
      fireEvent.click(interaction, { detail: 0 });
    }
    expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ datumIndex: 1 }));
  });

  it('reselects a dismissed period on Enter before opening it', () => {
    const onActivate = vi.fn();
    const { interaction, active } = renderChart({ data: quarter, onActivate });
    press(interaction, 'End', 'Escape', 'Enter');
    expect(onActivate).not.toHaveBeenCalled();
    expect(active()).toMatchObject({ category: 'Mar' });

    fireEvent.keyDown(interaction, { key: 'Enter' });
    expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'Mar' }));
  });

  it('selects and activates a projection-only period with the keyboard', () => {
    const datum = { period: 'Mar', gained: 0, lost: 0 };
    const onActivate = vi.fn();
    const { interaction, getByRole, active } = renderChart({
      ...growthChart,
      data: [datum],
      onActivate,
      projection: { datumIndex: 0, value: 20 },
    });

    fireEvent.focus(interaction);
    expect(getByRole('status')).toHaveTextContent('Mar, positive values');
    fireEvent.keyDown(interaction, { key: 'Enter' });
    expect(active()).toMatchObject({ category: 'Mar', section: 'positive' });
    expect(onActivate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ datum, datumIndex: 0, section: 'positive' }),
    );
  });

  it.each([
    { name: 'absent', projection: undefined },
    {
      name: 'rejected',
      projection: { datumIndex: 0, value: 0 },
    },
    {
      name: 'out-of-range',
      projection: { datumIndex: 1, value: 20 },
    },
    {
      name: 'zero-height',
      projection: { datumIndex: 0, value: -10 },
    },
  ])('does not activate zero values with an $name projection', ({ projection }) => {
    const onSelectionChange = vi.fn();
    const onActivate = vi.fn();
    const { interaction, getByRole } = renderChart({
      data: [{ period: 'Jan', value: 0 }],
      projection,
      onSelectionChange,
      onActivate,
    });

    fireEvent.focus(interaction);
    expect(getByRole('status')).toHaveTextContent('No values for this period');
    fireEvent.keyDown(interaction, { key: 'Enter' });

    expect(onSelectionChange).not.toHaveBeenCalledWith(expect.anything());
    expect(onActivate).not.toHaveBeenCalled();
  });
});

describe('keeping the selection when data changes', () => {
  it('keeps the selected period when the data is reordered', () => {
    const onActivate = vi.fn();
    const data = quarter.slice(0, 2);
    const { rerenderChart, getByRole, active } = renderChart({
      data,
      onActivate,
    });
    fireEvent.focus(getByRole('button'));
    const refreshed = { period: 'Jan', value: 99 };
    rerenderChart({ data: [data[1], refreshed] });
    expect(active()).toMatchObject({ category: 'Jan', datumIndex: 1 });
    expect(getByRole('status')).toHaveTextContent('Jan, positive values');
    fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
    expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ datum: refreshed, datumIndex: 1 }));
  });

  it('keeps a consumer that stores the selection in sync as its data changes', () => {
    function Consumer({ value }: { value: number }) {
      const data = [{ period: 'Jan', value }];
      const [active, setActive] = useState<BarSelection | null>(null);
      return (
        <>
          <output aria-label='Selected value'>{data.find(datum => datum.period === active?.category)?.value}</output>
          <TestChart
            data={data}
            series={[{ key: 'value', value: datum => datum.value }]}
            index={datum => datum.period}
            ariaLabel='Growth'
            onSelectionChange={setActive}
          />
        </>
      );
    }
    const { getByRole, rerender } = render(<Consumer value={10} />);
    const selectedValue = () => getByRole('status', { name: 'Selected value' });
    fireEvent.focus(getByRole('group', { name: 'Growth' }));
    expect(selectedValue()).toHaveTextContent('10');
    rerender(<Consumer value={25} />);
    expect(selectedValue()).toHaveTextContent('25');
  });

  it.each(['Enter', ' ', 'ArrowDown'])(
    'moves the keyboard selection to a remaining period after data shrinks for %s',
    key => {
      const onActivate = vi.fn();
      const { interaction, rerenderChart, active } = renderChart({
        data: quarter,
        onActivate,
      });
      press(interaction, 'End');
      rerenderChart({ data: quarter.slice(0, 1) });
      fireEvent.keyDown(interaction, { key });
      expect(active()).toMatchObject({ datumIndex: 0, category: 'Jan' });
      if (key !== 'ArrowDown') {
        expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ datumIndex: 0, datum: quarter[0] }));
      }
    },
  );

  it('clears the keyboard announcement when its selected section disappears', () => {
    const { getByRole, rerenderChart, active } = renderChart({
      ...growthChart,
      data: [{ period: 'Jan', gained: 10, lost: -10 }],
    });
    const control = getByRole('group');
    press(control, 'ArrowDown');
    expect(getByRole('status')).toHaveTextContent('Jan, negative values');
    rerenderChart({ data: [{ period: 'Jan', gained: 10, lost: 0 }] });
    expect(active()).toBeNull();
    expect(getByRole('status')).toBeEmptyDOMElement();
    fireEvent.keyDown(control, { key: 'ArrowDown' });
    expect(getByRole('status')).toHaveTextContent('Jan, positive values');
  });
});

describe('reading the selected period as data changes', () => {
  it('clears a removed period and announces the next selected one', () => {
    const { interaction, getByRole, rerenderChart } = renderChart({
      data: [{ period: 'Jan', value: 10 }],
    });
    fireEvent.focus(interaction);
    expect(getByRole('status')).toHaveTextContent('Jan, positive values');

    rerenderChart({ data: [{ period: 'Feb', value: 25 }] });
    expect(getByRole('status')).toBeEmptyDOMElement();

    fireEvent.keyDown(interaction, { key: 'Home' });
    expect(getByRole('status')).toHaveTextContent('Feb, positive values');
  });
});

describe('controlling the selection', () => {
  const selectedTick = () => document.querySelector('text[data-active]')?.textContent ?? null;

  it('reports each keyboard move to onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    const { interaction } = renderChart({ data: quarter, onSelectionChange });

    press(interaction, 'ArrowRight', 'ArrowRight', 'Escape');

    expect(onSelectionChange.mock.calls).toEqual([
      [{ category: 'Jan', section: 'positive' }],
      [{ category: 'Feb', section: 'positive' }],
      [{ category: 'Mar', section: 'positive' }],
      [null],
    ]);
  });

  it('shows the controlled selection and keeps it until the value changes', () => {
    const onSelectionChange = vi.fn();
    const { interaction, getByTestId, queryByTestId, rerenderChart, active } = renderChart({
      data: quarter,
      selection: { category: 'Feb', section: 'positive' },
      onSelectionChange,
    });
    expect(selectedTick()).toBe('Feb');
    expect(getByTestId('cursor')).toBeInTheDocument();

    fireEvent.keyDown(interaction, { key: 'ArrowRight' });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ category: 'Mar', section: 'positive' });
    expect(active()).toMatchObject({ category: 'Feb', datumIndex: 1 });

    rerenderChart({ selection: null });
    expect(selectedTick()).toBeNull();
    expect(queryByTestId('cursor')).toBeNull();
  });

  it('reselects a dismissed period on Enter when the consumer holds the selection', () => {
    const onActivate = vi.fn();
    function Consumer() {
      const [selection, setSelection] = useState<BarSelection | null>(null);
      return (
        <TestChart
          {...chartFixture}
          data={quarter}
          selection={selection}
          onSelectionChange={setSelection}
          onActivate={onActivate}
        />
      );
    }
    render(<Consumer />);
    const interaction = screen.getByRole('button', { name: 'Growth' });

    press(interaction, 'End', 'Escape', 'Enter');
    expect(onActivate).not.toHaveBeenCalled();
    expect(selectedTick()).toBe('Mar');

    fireEvent.keyDown(interaction, { key: 'Enter' });
    expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'Mar' }));
  });
});

describe('rendering from the chart object', () => {
  it('selects with the keyboard on a surface that spreads the interaction props', () => {
    function CustomChart() {
      const chart = BarChart.useBarChart({ ...chartFixture, data: quarter, onSelectionChange: () => {} });
      const { rootRef } = chart;
      return (
        <div ref={rootRef}>
          <div
            {...chart.getInteractionProps()}
            aria-label='Growth'
          >
            {chart.categories.map(category => (
              <span key={category.key}>{category.key}</span>
            ))}
          </div>
          <output aria-label='Selected period'>{chart.selected?.category}</output>
        </div>
      );
    }
    render(<CustomChart />);
    const surface = screen.getByRole('group', { name: 'Growth' });

    press(surface, 'End');

    expect(screen.getByRole('status', { name: 'Selected period' })).toHaveTextContent('Mar');
  });
});
