import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Input } from '../input';
import { InputGroup } from '../input-group';
import { Otp } from '../otp';

afterEach(() => cleanup());

describe('input surface motion', () => {
  it('shows hover at once and fades it on the way out', async () => {
    render(
      <>
        <Input aria-label='Name' />
        <button type='button'>Elsewhere</button>
      </>,
    );
    const input = screen.getByRole('textbox');

    await userEvent.hover(input);
    await nextFrame();
    expect(runningProperties(input)).toEqual([]);

    await settle();
    await userEvent.hover(screen.getByRole('button'));
    await nextFrame();
    expect(runningProperties(input)).toContain('border-top-color');
  });

  it('shows focus at once and fades the ring and border on the way out', async () => {
    render(
      <>
        <Input aria-label='Name' />
        <button type='button'>Elsewhere</button>
      </>,
    );
    const input = screen.getByRole('textbox');

    await userEvent.tab();
    await nextFrame();
    expect(input.matches(':focus-visible')).toBe(true);
    expect(runningProperties(input)).toEqual([]);

    await settle();
    await userEvent.tab();
    await nextFrame();
    expect(runningProperties(input)).toEqual(expect.arrayContaining(['border-top-color', 'box-shadow']));
  });

  it('fades a validation colour that lands on a focused field', async () => {
    const { rerender } = render(<Input aria-label='Name' />);
    const input = screen.getByRole('textbox');

    await userEvent.tab();
    await settle();
    rerender(
      <Input
        aria-label='Name'
        aria-invalid
      />,
    );
    await nextFrame();

    expect(runningProperties(input)).toEqual(expect.arrayContaining(['border-top-color', 'box-shadow']));
  });

  it('shows focus at once on an input group', async () => {
    render(
      <InputGroup.Root data-testid='group'>
        <Input aria-label='Name' />
      </InputGroup.Root>,
    );

    await userEvent.tab();
    await nextFrame();

    expect(runningProperties(screen.getByTestId('group'))).toEqual([]);
  });

  it('fades the success colour on the focused otp slot', async () => {
    const { rerender } = render(<Otp aria-label='Code' />);

    await userEvent.tab();
    await settle();
    const slot = document.activeElement;
    if (!(slot instanceof HTMLInputElement)) {
      throw new Error('Expected an otp slot to hold focus');
    }
    rerender(
      <Otp
        aria-label='Code'
        status='success'
      />,
    );
    await nextFrame();

    expect(runningProperties(slot)).toContain('border-top-color');
  });
});

function runningProperties(element: Element) {
  return element
    .getAnimations()
    .map(animation => (animation instanceof CSSTransition ? animation.transitionProperty : animation.constructor.name));
}

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

function settle() {
  return new Promise<void>(resolve => setTimeout(resolve, 300));
}
