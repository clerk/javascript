import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Card } from '../../card';
import { Otp } from '../otp';

afterEach(() => cleanup());

describe('Otp', () => {
  it('keeps the slots in reading order in a right-to-left layout', () => {
    render(
      <div dir='rtl'>
        <Otp
          aria-label='Verification code'
          length={3}
        />
      </div>,
    );

    const lefts = screen.getAllByRole('textbox').map(slot => slot.getBoundingClientRect().left);
    expect(lefts[0]).toBeLessThan(lefts[1]);
    expect(lefts[1]).toBeLessThan(lefts[2]);
  });

  it('draws 48px squares in a left-aligned card, starting at the left edge', () => {
    render(
      <div style={{ width: 380 }}>
        <Card.Root>
          <Otp aria-label='Verification code' />
        </Card.Root>
      </div>,
    );

    const boxes = screen.getAllByRole('textbox').map(box => box.getBoundingClientRect());
    for (const { width, height } of boxes) {
      expect([width, height]).toEqual([48, 48]);
    }
    expect(boxes[0].left).toBeCloseTo(screen.getByRole('group').getBoundingClientRect().left, 0);
  });

  it('draws the same 48px squares in a centered card, centered in the row', () => {
    render(
      <div style={{ width: 420 }}>
        <Card.Root align='center'>
          <Otp aria-label='Verification code' />
        </Card.Root>
      </div>,
    );

    const boxes = screen.getAllByRole('textbox').map(box => box.getBoundingClientRect());
    for (const { width, height } of boxes) {
      expect([width, height]).toEqual([48, 48]);
    }
    const root = screen.getByRole('group').getBoundingClientRect();
    expect(boxes[0].left - root.left).toBeCloseTo(root.right - boxes[5].right, 0);
  });

  it('shakes the row when the code is rejected, and stays still otherwise', () => {
    const { rerender } = render(
      <Otp
        aria-label='Verification code'
        status='neutral'
      />,
    );
    const root = screen.getByRole('group');
    expect(getComputedStyle(root).animationName).toBe('none');

    rerender(
      <Otp
        aria-label='Verification code'
        status='error'
      />,
    );
    expect(getComputedStyle(root).animationName).not.toBe('none');
  });

  it('spaces all six boxes evenly, with no divider between them', () => {
    render(<Otp aria-label='Verification code' />);

    const boxes = screen.getAllByRole('textbox').map(box => box.getBoundingClientRect());
    const gap = (a: number) => boxes[a + 1].left - boxes[a].right;
    expect(gap(2)).toBeCloseTo(gap(1), 0);
    expect(gap(1)).toBeCloseTo(gap(0), 0);
  });

  function Rejecting() {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'neutral' | 'error'>('neutral');
    return (
      <Otp
        aria-label='Verification code'
        value={value}
        status={status}
        onValueChange={next => {
          setValue(next);
          setStatus('neutral');
        }}
        onComplete={() => setStatus('error')}
      />
    );
  }

  it('keeps a rejected code in red, then edits it one digit at a time and drops the error', async () => {
    render(<Rejecting />);
    const boxes = screen.getAllByRole<HTMLInputElement>('textbox');
    const neutralBorder = getComputedStyle(boxes[3]).borderTopColor;
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('481935');

    await waitFor(() => expect(getComputedStyle(boxes[0]).borderTopColor).not.toBe(neutralBorder));
    expect(boxes.map(box => box.value).join('')).toBe('481935');

    await userEvent.keyboard('{Backspace}');

    await waitFor(() => expect(boxes.map(box => box.value).join('')).toBe('48193'));
    await waitFor(() => expect(getComputedStyle(boxes[0]).borderTopColor).toBe(neutralBorder));
  });
});
