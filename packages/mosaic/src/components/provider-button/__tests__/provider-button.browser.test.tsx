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

  it.each(['xs', 'sm', 'md', 'lg'] as const)('does not move anything when the spinner appears (%s)', size => {
    const boxes = () => {
      const { width, height } = screen.getByRole('button').getBoundingClientRect();
      const label = screen.getByText('Continue with Google').getBoundingClientRect();
      return { width, height, labelLeft: label.left, labelTop: label.top };
    };
    const { rerender } = render(
      <ProviderButton
        icon={<svg style={{ width: 16, height: 16 }} />}
        longLabel='Continue with Google'
        shortLabel='Google'
        size={size}
      />,
    );
    const before = boxes();
    rerender(
      <ProviderButton
        icon={<svg style={{ width: 16, height: 16 }} />}
        longLabel='Continue with Google'
        shortLabel='Google'
        size={size}
        isPending
        spinDelay={{ delay: 0 }}
      />,
    );
    expect(screen.getByRole('button').querySelector('.cl-spinner')).not.toBeNull();
    expect(boxes()).toEqual(before);
  });
});

describe('last used provider', () => {
  function renderWithLastUsed(
    count: number,
    {
      width = 600,
      layout,
      dir,
      disabled,
      isPending,
      longLabel = 'Continue with Google',
    }: {
      width?: number;
      layout?: 'inline' | 'stacked';
      dir?: 'rtl';
      disabled?: boolean;
      isPending?: boolean;
      longLabel?: string;
    } = {},
  ) {
    render(
      <div
        dir={dir}
        style={{ width, paddingBlockStart: 24 }}
      >
        <ProviderButtonGroup
          layout={layout}
          disabled={disabled}
          lastUsed={
            <ProviderButton
              icon={<svg style={{ width: 16, height: 16 }} />}
              longLabel={longLabel}
              shortLabel='Google'
              badge='Last used'
              isPending={isPending}
            />
          }
        >
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

  const badgeBox = () => {
    const badge = screen.getByText('Last used').closest('.cl-badge');
    if (!badge) {
      throw new Error('badge not rendered');
    }
    return badge;
  };

  it.each([
    [1, [1, 1]],
    [2, [1, 2]],
    [3, [1, 3]],
    [6, [1, 3, 3]],
    [7, [1, 4, 3]],
  ])('puts it on its own row and balances the %i others', (count, rows) => {
    expect(rowLengths(renderWithLastUsed(count))).toEqual(rows);
  });

  it('renders it first and at the full width of the group', () => {
    const buttons = renderWithLastUsed(2);
    expect(buttons[0]).toHaveAccessibleName(/Continue with Google/);
    expect(buttons[0].getBoundingClientRect().width).toBe(600);
  });

  it('keeps its long label however many others there are', () => {
    renderWithLastUsed(3);
    expect(isShown('Continue with Google')).toBe(true);
    expect(isShown('Google')).toBe(false);
  });

  it.each([
    [1, 'Continue with Provider 0'],
    [2, 'Provider 0'],
  ])('picks the labels of the %i others from their own count', (count, label) => {
    renderWithLastUsed(count);
    expect(isShown(label)).toBe(true);
  });

  it('shows only icons for three others', () => {
    renderWithLastUsed(3);
    expect(isShown('Provider 0')).toBe(false);
    expect(isShown('Continue with Provider 0')).toBe(false);
  });

  it('leaves no gap under it when it is the only provider', () => {
    const [button] = renderWithLastUsed(0);
    const group = button.parentElement;
    expect(group?.getBoundingClientRect().height).toBe(button.getBoundingClientRect().height);
  });

  it('gives every button its own row when stacked', () => {
    expect(rowLengths(renderWithLastUsed(2, { layout: 'stacked' }))).toEqual([1, 1, 1]);
  });

  it('keeps the same gap between the rows as inside them', () => {
    const buttons = renderWithLastUsed(6);
    const [lastUsed, second, , , fifth] = buttons.map(button => button.getBoundingClientRect());
    expect(second.top - lastUsed.bottom).toBe(fifth.top - second.bottom);
  });

  it('disables it with the group', () => {
    const [lastUsed] = renderWithLastUsed(1, { disabled: true });
    expect(lastUsed).toBeDisabled();
  });

  describe('badge', () => {
    it('adds the badge to the accessible name', () => {
      const [lastUsed] = renderWithLastUsed(1);
      expect(lastUsed).toHaveAccessibleName('Continue with Google, Last used');
    });

    it('overhangs the top corner at the inline end', () => {
      const [lastUsed] = renderWithLastUsed(1);
      const button = lastUsed.getBoundingClientRect();
      const badge = badgeBox().getBoundingClientRect();
      expect(badge.top).toBeLessThan(button.top);
      expect(badge.bottom).toBeGreaterThan(button.top);
      expect(badge.right).toBeGreaterThan(button.right);
      expect(badge.left).toBeGreaterThan(button.left + button.width / 2);
    });

    it('overhangs the left corner in RTL', () => {
      const [lastUsed] = renderWithLastUsed(1, { dir: 'rtl' });
      const button = lastUsed.getBoundingClientRect();
      const badge = badgeBox().getBoundingClientRect();
      expect(badge.left).toBeLessThan(button.left);
      expect(badge.right).toBeLessThan(button.left + button.width / 2);
    });

    it('is not clipped by the button or the group', () => {
      const [lastUsed] = renderWithLastUsed(1);
      const group = lastUsed.parentElement;
      for (const element of [lastUsed, group]) {
        expect(element && getComputedStyle(element).overflow).toBe('visible');
      }
    });

    it('does not change the height of the button', () => {
      const [lastUsed] = renderWithLastUsed(1);
      const [other] = screen.getAllByRole('button').slice(1);
      expect(lastUsed.getBoundingClientRect().height).toBe(other.getBoundingClientRect().height);
    });

    it('stays while pending, at full opacity', () => {
      const [lastUsed] = renderWithLastUsed(1, { disabled: true, isPending: true });
      expect(screen.getByText('Last used')).toBeVisible();
      expect(getComputedStyle(lastUsed).opacity).toBe('1');
    });

    it('keeps a truncated label inside the button', () => {
      const longLabel = 'Continue with a very long enterprise identity provider name';
      const [lastUsed] = renderWithLastUsed(1, { width: 180, longLabel });
      const label = screen.getByText(longLabel);
      expect(lastUsed.getBoundingClientRect().width).toBe(180);
      expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
      expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(lastUsed.getBoundingClientRect().right);
    });

    it('renders no badge without the prop', () => {
      renderGroup(1);
      expect(screen.queryByText('Last used')).toBeNull();
    });
  });
});
