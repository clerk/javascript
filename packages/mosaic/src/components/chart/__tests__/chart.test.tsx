import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Chart, type ChartSeries } from '..';
import { bridgeSeries } from '../internal/series-bridge';

afterEach(() => cleanup());

type Row = { signups: number; churned: number };

const signups: ChartSeries<Row> = { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups };

const series: ChartSeries<Row>[] = [
  signups,
  { key: 'churned', label: 'Churned', color: 'var(--brand-red)', value: row => row.churned, description: 'Lost users' },
];

describe('Chart.Legend', () => {
  it('lists each series by label, keyed by its series key', () => {
    render(<Chart.Legend items={series} />);

    const items = screen.getAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual(['Sign-ups', 'Churned']);
    expect(items.map(item => item.getAttribute('data-series'))).toEqual(['signups', 'churned']);
  });

  it('makes an item with a description a button that shows it in a tooltip', async () => {
    render(<Chart.Legend items={series} />);

    const trigger = screen.getByRole('button', { name: 'Churned' });
    await act(() => trigger.focus());

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Lost users');
    expect(screen.queryByRole('button', { name: 'Sign-ups' })).toBeNull();
  });

  it('draws a dashed swatch for a projection entry', () => {
    render(
      <Chart.Legend
        items={[{ key: 'projection', label: 'Projected', color: 'var(--cl-color-foreground)', swatch: 'dashed' }]}
      />,
    );

    expect(screen.getByRole('listitem').querySelector('.cl-chart-swatch')).toHaveAttribute('data-swatch', 'dashed');
  });
});

describe('Chart.TooltipContent', () => {
  it('shows the heading, the metrics and one row per series with its value', () => {
    render(
      <Chart.TooltipContent
        heading='Jan 5, 2026'
        trailing={<span>+12%</span>}
        metrics={[{ label: 'Total', value: '1,204' }]}
        rows={[
          { key: 'signups', label: 'Sign-ups', color: 1, value: '1,000' },
          { key: 'returning', label: 'Returning', color: 2, value: '204' },
        ]}
        footer={<p>Incomplete period</p>}
      />,
    );

    expect(screen.getByText('Jan 5, 2026').parentElement).toHaveTextContent('Jan 5, 2026+12%');
    expect(screen.getByRole('term')).toHaveTextContent('Total');
    expect(screen.getByRole('definition')).toHaveTextContent('1,204');
    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows.map(row => [row.getAttribute('data-series'), row.textContent])).toEqual([
      ['signups', 'Sign-ups1,000'],
      ['returning', 'Returning204'],
    ]);
    expect(screen.getByText('Incomplete period')).toBeInTheDocument();
  });
});

describe('series boundary', () => {
  it('keys series by position and resolves palette slots to their tokens', () => {
    const bridge = bridgeSeries(series);

    expect(bridge.positioned.map(entry => entry.key)).toEqual(['0', '1']);
    expect(bridge.colors).toEqual(['var(--cl-color-chart-1)', 'var(--brand-red)']);
    expect(bridge.seriesAt('1').key).toBe('churned');
  });

  it('rejects a repeated key', () => {
    expect(() => bridgeSeries([...series, signups])).toThrow('Two chart series share the key "signups"');
  });

  it('rejects more series than the chart has slots, naming the fix', () => {
    const many = Array.from({ length: 9 }, (_, i): ChartSeries<Row> => ({ ...signups, key: `s${i}` }));

    expect(() => bridgeSeries(many)).toThrow(/at most 8 series, and got 9. Fold the smallest into one "Other" series/);
  });
});
