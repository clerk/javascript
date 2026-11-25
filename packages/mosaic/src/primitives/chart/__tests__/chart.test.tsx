import { cleanup, fireEvent, render as renderComponent, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import type { RenderProps } from '../../utils';
import { type BarSelection, Chart } from '..';
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
  render?: React.ComponentProps<typeof Chart.Root>['render'];
  children?: React.ReactNode;
}) {
  const chart = Chart.useBarChart({ data, series: chartFixture.series, index: chartFixture.index });
  return (
    <Chart.Root
      chart={chart}
      aria-label='Growth'
      render={renderProp}
    >
      {children}
    </Chart.Root>
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
    ['Chart.Grid', <Chart.Grid key='grid' />],
    ['Chart.Selection', <Chart.Selection key='selection' />],
    ['Chart.Bars', <Chart.Bars key='bars' />],
  ])('throws when %s is used outside Chart.Root', (part, element) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderComponent(element)).toThrow(`<${part}> must be used within <Chart.Root>`);
  });

  it.each([
    ['Cursor', <Chart.Cursor key='cursor' />],
    ['Tooltip', <Chart.Tooltip key='tooltip'>{() => 'Growth'}</Chart.Tooltip>],
  ])('throws when Chart.%s is used outside Chart.Selection', (part, element) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<StackedChart>{element}</StackedChart>)).toThrow(
      `<Chart.${part}> must be used within <Chart.Selection>`,
    );
  });

  it('throws when Chart.Bar is used outside Chart.Bars', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <StackedChart>
          <Chart.Bar />
        </StackedChart>,
      ),
    ).toThrow('<Chart.Bar> must be used within <Chart.Bars>');
  });

  function ChartWithoutValueAxis({ children }: { children: React.ReactNode }) {
    const { scaleY: _scaleY, yTicks: _yTicks, ...chart } = Chart.useBarChart(chartFixture);
    return (
      <Chart.Root
        chart={chart}
        aria-label='Growth'
      >
        {children}
      </Chart.Root>
    );
  }

  it.each([
    ['Grid', <Chart.Grid key='grid' />],
    ['YAxis', <Chart.YAxis key='y-axis' />],
    [
      'YLine',
      <Chart.YLine
        key='y-line'
        value={0}
      />,
    ],
  ])('throws when Chart.%s is given a chart without a value axis', (part, element) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ChartWithoutValueAxis>{element}</ChartWithoutValueAxis>)).toThrow(
      `<Chart.${part}> needs a chart with a value axis, such as one from Chart.useBarChart`,
    );
  });

  it.each([
    ['an element', <section key='element' />],
    ['a function', (props: RenderProps) => <section {...props} />],
  ])('renders a part as %s passed to render', (_, renderElement) => {
    const { container } = render(
      <StackedChart render={renderElement}>
        <Chart.Bars />
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

  it('is interactive with Chart.Selection and categories', () => {
    const { container, rerender } = render(
      <StackedChart>
        <Chart.Bars />
        <Chart.Selection />
      </StackedChart>,
    );

    expect(chartRoot(container)).toHaveAttribute('data-chart-interaction-mode', 'interactive');
    expect(screen.getByRole('group')).toBeInTheDocument();

    rerender(
      <StackedChart data={[]}>
        <Chart.Bars />
        <Chart.Selection />
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
    rerenderChart({ selectionPart: false });
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

  const signups = [{ key: 'signups', label: 'Sign-ups', value: (row: ChartRow) => row.value }];
  const gainedAndLost = [
    { key: 'gained', label: 'Gained', value: (row: (typeof twoSided)[number]) => row.gained },
    { key: 'lost', label: 'Lost', value: (row: (typeof twoSided)[number]) => row.lost },
    { key: 'paused', label: 'Paused', value: () => 0 },
  ];

  it.each([
    {
      name: 'the period and its value, without a section, when no value is negative',
      props: { data: quarter, series: signups },
      keys: ['ArrowRight'],
      announcement: 'Feb, Sign-ups 20',
    },
    {
      name: 'the series key when a series has no label',
      props: { data: quarter },
      keys: ['ArrowRight'],
      announcement: 'Feb, value 20',
    },
    {
      name: 'the formatted period name and value',
      props: {
        data: quarter,
        series: signups,
        formatXTick: (period: string) => `${period} 2026`,
        formatValue: (value: number) => `${value} people`,
      },
      keys: [],
      announcement: 'Jan 2026, Sign-ups 10 people',
    },
    {
      name: 'the projection beside the values',
      props: { data: quarter, series: signups, projection: { datumIndex: 2, value: 50, label: 'Projected' } },
      keys: ['End'],
      announcement: 'Mar, Sign-ups 30, Projected 50',
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
    const { interaction, getByRole } = renderChart<ChartRow>(props);
    press(interaction, ...keys);
    expect(getByRole('status').textContent).toBe(announcement);
  });

  it.each([
    { keys: [], announcement: 'Jan, positive values, Gained 12' },
    { keys: ['ArrowDown'], announcement: 'Jan, negative values, Lost -4' },
  ])('announces the section and its nonzero values after $keys on a stacked chart', ({ keys, announcement }) => {
    const { interaction, getByRole } = renderChart({ ...growthChart, series: gainedAndLost, data: twoSided });
    press(interaction, ...keys);
    expect(getByRole('status').textContent).toBe(announcement);
  });

  const french = { negativeValues: 'valeurs négatives', noValues: 'Aucune valeur pour cette période' };

  it('announces a section in the language of `messages`', () => {
    const { interaction, getByRole } = renderChart({
      ...growthChart,
      series: gainedAndLost,
      data: twoSided,
      messages: french,
    });
    press(interaction, 'ArrowDown');
    expect(getByRole('status').textContent).toBe('Jan, valeurs négatives, Lost -4');
  });

  it('announces a period with no values in the language of `messages`', () => {
    const { interaction, getByRole } = renderChart({
      data: [
        { period: 'Jan', value: 10 },
        { period: 'Feb', value: 0 },
      ],
      messages: french,
    });
    press(interaction, 'ArrowRight');
    expect(getByRole('status')).toHaveTextContent('Aucune valeur pour cette période');
  });

  it('leaves Up and Down out of the keys when no value is negative', () => {
    const { interaction } = renderChart({ data: quarter });
    expect(interaction).toHaveAccessibleDescription(
      'Use Left and Right to choose a period, or Home and End to jump to the first or last. Press Escape to dismiss.',
    );
  });

  it('describes the keys in the language of `messages`', () => {
    const { interaction } = renderChart({
      ...growthChart,
      data: twoSided,
      onActivate: () => {},
      messages: {
        navigate: 'Gauche et Droite choisissent une période.',
        vertical: 'Haut et Bas choisissent une section.',
        activate: 'Entrée ouvre la période.',
        dismiss: 'Échap ferme.',
      },
    });
    expect(interaction).toHaveAccessibleDescription(
      'Gauche et Droite choisissent une période. Haut et Bas choisissent une section. Entrée ouvre la période. Échap ferme.',
    );
  });
});

describe('accessibility (axe)', () => {
  it.each([
    { name: 'a group', props: {} },
    { name: 'a button', props: { onActivate: () => {} } },
  ])('has no violations as $name', async ({ props }) => {
    const { container } = renderChart({ data: quarter, ...props });
    expect(await axe(container)).toHaveNoViolations();
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
    expect(getByRole('status')).toHaveTextContent('Mar, Projected 20');
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
    expect(getByRole('status')).toHaveTextContent('Jan, value 99');
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
    expect(getByRole('status')).toHaveTextContent('Jan, negative values, lost -10');
    rerenderChart({ data: [{ period: 'Jan', gained: 10, lost: 0 }] });
    expect(active()).toBeNull();
    expect(getByRole('status')).toBeEmptyDOMElement();
    fireEvent.keyDown(control, { key: 'ArrowDown' });
    expect(getByRole('status').textContent).toBe('Jan, gained 10');
  });
});

describe('reading the selected period as data changes', () => {
  it('clears a removed period and announces the next selected one', () => {
    const { interaction, getByRole, rerenderChart } = renderChart({
      data: [{ period: 'Jan', value: 10 }],
    });
    fireEvent.focus(interaction);
    expect(getByRole('status')).toHaveTextContent('Jan, value 10');

    rerenderChart({ data: [{ period: 'Feb', value: 25 }] });
    expect(getByRole('status')).toBeEmptyDOMElement();

    fireEvent.keyDown(interaction, { key: 'Home' });
    expect(getByRole('status')).toHaveTextContent('Feb, value 25');
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
      const chart = Chart.useBarChart({ ...chartFixture, data: quarter, onSelectionChange: () => {} });
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
