import { cleanup, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { SegmentedControl } from '.';

afterEach(() => cleanup());

function Control({ fullWidth }: { fullWidth?: boolean }) {
  return (
    <SegmentedControl.Root
      aria-label='Mode'
      defaultValue='email'
      fullWidth={fullWidth}
      data-testid='root'
    >
      <SegmentedControl.Item
        value='email'
        data-testid='short'
      >
        Email
      </SegmentedControl.Item>
      <SegmentedControl.Item
        value='role'
        data-testid='long'
      >
        A much longer label
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}

const flexColumn: CSSProperties = { display: 'flex', flexDirection: 'column', width: 600 };
const grid: CSSProperties = { display: 'grid', width: 600 };

describe('SegmentedControl.Root width', () => {
  it.each([
    ['flex column', flexColumn],
    ['grid', grid],
  ])('keeps its natural width in a %s', (_, style) => {
    render(
      <div
        style={style}
        data-testid='parent'
      >
        <Control />
      </div>,
    );

    const parent = screen.getByTestId('parent').getBoundingClientRect();
    const root = screen.getByTestId('root').getBoundingClientRect();

    expect(root.width).toBeLessThan(parent.width);
    expect(root.left).toBe(parent.left);
  });

  it.each([
    ['flex column', flexColumn],
    ['grid', grid],
  ])('fills a %s with fullWidth and splits it evenly', (_, style) => {
    render(
      <div
        style={style}
        data-testid='parent'
      >
        <Control fullWidth />
      </div>,
    );

    const parent = screen.getByTestId('parent').getBoundingClientRect();
    const root = screen.getByTestId('root').getBoundingClientRect();
    const short = screen.getByTestId('short').getBoundingClientRect();
    const long = screen.getByTestId('long').getBoundingClientRect();

    const indicator = screen.getByTestId('root').querySelector(':scope > .cl-segmented-control-indicator');

    expect(root.width).toBe(parent.width);
    expect(short.width).toBeCloseTo(long.width, 0);
    expect(indicator?.getBoundingClientRect().width).toBeCloseTo(short.width, 0);
  });
});
