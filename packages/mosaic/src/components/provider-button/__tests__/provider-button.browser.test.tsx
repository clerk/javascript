import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { ProviderButton, ProviderButtonGroup } from '../index';

afterEach(() => cleanup());

function renderGroup(count: number, { width = 600, layout }: { width?: number; layout?: 'inline' | 'stacked' } = {}) {
  render(
    <div style={{ width }}>
      <ProviderButtonGroup layout={layout}>
        {Array.from({ length: count }, (_, index) => (
          <ProviderButton
            key={index}
            icon={<svg style={{ width: 16, height: 16 }} />}
            longLabel={`Continue with Provider ${index}`}
            shortLabel={`Provider ${index}`}
          />
        ))}
      </ProviderButtonGroup>
    </div>,
  );
  return screen.getAllByRole('button');
}

function rowLengths(buttons: HTMLElement[]) {
  const rows = new Map<number, number>();
  for (const button of buttons) {
    const top = Math.round(button.getBoundingClientRect().top);
    rows.set(top, (rows.get(top) ?? 0) + 1);
  }
  return [...rows.values()];
}

const isShown = (text: string) => getComputedStyle(screen.getByText(text)).display !== 'none';

describe('inline rows', () => {
  it.each([
    [1, [1]],
    [2, [2]],
    [3, [3]],
    [4, [4]],
    [5, [5]],
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
    [9, [5, 4]],
    [10, [5, 5]],
    [11, [4, 4, 3]],
    [12, [4, 4, 4]],
    [13, [5, 5, 3]],
    [14, [5, 5, 4]],
    [15, [5, 5, 5]],
  ])('balances %i buttons like the legacy distribution', (count, rows) => {
    expect(rowLengths(renderGroup(count))).toEqual(rows);
  });

  it.each([7, 9, 11, 13])('keeps a short last row at full button width and centered (%i)', count => {
    const buttons = renderGroup(count);
    const first = buttons[0].getBoundingClientRect();
    const last = buttons[buttons.length - 1].getBoundingClientRect();
    expect(last.width).toBeCloseTo(first.width, 0);

    const parent = buttons[0].parentElement?.getBoundingClientRect();
    const lastRow = buttons.filter(b => b.getBoundingClientRect().top === last.top);
    const left = lastRow[0].getBoundingClientRect().left - (parent?.left ?? 0);
    const right = (parent?.right ?? 0) - last.right;
    expect(left).toBeCloseTo(right, 0);
  });

  it('fills the row with equal widths', () => {
    const [a, b, c] = renderGroup(3).map(button => button.getBoundingClientRect().width);
    expect(a).toBeCloseTo(b, 0);
    expect(b).toBeCloseTo(c, 0);
    expect((a + b + c) / 600).toBeGreaterThan(0.95);
  });

  it('collapses two buttons to one column in a narrow container', () => {
    expect(rowLengths(renderGroup(2, { width: 280 }))).toEqual([1, 1]);
  });

  it('keeps three icon buttons in one row in a narrow container', () => {
    expect(rowLengths(renderGroup(3, { width: 280 }))).toEqual([3]);
  });
});

describe('label forms', () => {
  it('shows only the long label for one inline button', () => {
    renderGroup(1);
    expect(isShown('Continue with Provider 0')).toBe(true);
    expect(isShown('Provider 0')).toBe(false);
  });

  it('shows only the short label for two inline buttons', () => {
    renderGroup(2);
    expect(isShown('Continue with Provider 0')).toBe(false);
    expect(isShown('Provider 0')).toBe(true);
  });

  it('shows neither label for three inline buttons, keeping the name', () => {
    const buttons = renderGroup(3);
    expect(isShown('Continue with Provider 0')).toBe(false);
    expect(isShown('Provider 0')).toBe(false);
    expect(buttons[0]).toHaveAccessibleName('Continue with Provider 0');
  });

  it('always shows the long label when stacked, one button per row', () => {
    const buttons = renderGroup(4, { layout: 'stacked' });
    expect(rowLengths(buttons)).toEqual([1, 1, 1, 1]);
    expect(isShown('Continue with Provider 3')).toBe(true);
    expect(isShown('Provider 3')).toBe(false);
  });

  it('keeps the button height when stacked', () => {
    const [inlineButton] = renderGroup(1);
    const inlineHeight = inlineButton.getBoundingClientRect().height;
    cleanup();
    const buttons = renderGroup(3, { layout: 'stacked' });
    for (const button of buttons) {
      expect(button.getBoundingClientRect().height).toBe(inlineHeight);
    }
  });

  it('truncates a long label rather than overflowing a narrow stacked group', () => {
    const buttons = renderGroup(2, { layout: 'stacked', width: 80 });
    for (const button of buttons) {
      expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(80);
    }
  });

  it('shows the long label outside a group', () => {
    render(
      <ProviderButton
        icon={<svg />}
        longLabel='Continue with Google'
        shortLabel='Google'
      />,
    );
    expect(isShown('Continue with Google')).toBe(true);
    expect(isShown('Google')).toBe(false);
  });

  it('keeps the pending button at full opacity while the group dims the rest', async () => {
    render(
      <ProviderButtonGroup disabled>
        <ProviderButton
          icon={<svg />}
          longLabel='Continue with Google'
          shortLabel='Google'
          isPending
        />
        <ProviderButton
          icon={<svg />}
          longLabel='Continue with GitHub'
          shortLabel='GitHub'
        />
      </ProviderButtonGroup>,
    );
    const [pending, sibling] = screen.getAllByRole('button');
    await expect.poll(() => getComputedStyle(sibling).opacity).toBe('0.5');
    expect(getComputedStyle(pending).opacity).toBe('1');
  });

  it('keeps its width when pending', () => {
    const { rerender } = render(
      <ProviderButton
        icon={<svg style={{ width: 16, height: 16 }} />}
        longLabel='Continue with Google'
        shortLabel='Google'
      />,
    );
    const width = screen.getByRole('button').getBoundingClientRect().width;
    rerender(
      <ProviderButton
        icon={<svg style={{ width: 16, height: 16 }} />}
        longLabel='Continue with Google'
        shortLabel='Google'
        isPending
        spinDelay={{ delay: 0 }}
      />,
    );
    expect(screen.getByRole('button').getBoundingClientRect().width).toBe(width);
  });
});
