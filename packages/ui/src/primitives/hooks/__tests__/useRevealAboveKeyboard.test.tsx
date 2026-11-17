import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRevealAboveKeyboard } from '../useRevealAboveKeyboard';

const TestInput = (props: { onFocus?: () => void; onBlur?: () => void }) => {
  const handlers = useRevealAboveKeyboard<HTMLInputElement>(props.onFocus, props.onBlur);
  return (
    <input
      aria-label='field'
      {...handlers}
    />
  );
};

const createViewport = (height: number) => {
  const viewport = Object.assign(new EventTarget(), { height, offsetTop: 0 });
  vi.stubGlobal('visualViewport', viewport);
  return viewport;
};

const placeInput = (input: HTMLElement, bottom: number) => {
  input.getBoundingClientRect = () => ({ bottom }) as DOMRect;
  const scrollIntoView = vi.fn();
  input.scrollIntoView = scrollIntoView;
  return scrollIntoView;
};

describe('useRevealAboveKeyboard', () => {
  let isIOS = true;

  beforeEach(() => {
    isIOS = true;
    vi.stubGlobal('CSS', { supports: () => isIOS });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scrolls the input into view when the keyboard covers it', () => {
    const viewport = createViewport(651);
    const { getByLabelText } = render(<TestInput />);
    const input = getByLabelText('field');
    const scrollIntoView = placeInput(input, 348);

    fireEvent.focus(input);
    expect(scrollIntoView).not.toHaveBeenCalled();

    viewport.height = 331;
    viewport.dispatchEvent(new Event('resize'));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
  });

  it('leaves the page alone when the input stays visible', () => {
    const viewport = createViewport(651);
    const { getByLabelText } = render(<TestInput />);
    const input = getByLabelText('field');
    const scrollIntoView = placeInput(input, 200);

    fireEvent.focus(input);
    viewport.height = 331;
    viewport.dispatchEvent(new Event('resize'));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('stops reacting to viewport changes after blur', () => {
    const viewport = createViewport(651);
    const { getByLabelText } = render(<TestInput />);
    const input = getByLabelText('field');
    const scrollIntoView = placeInput(input, 348);

    fireEvent.focus(input);
    fireEvent.blur(input);
    viewport.height = 331;
    viewport.dispatchEvent(new Event('resize'));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing outside iOS', () => {
    isIOS = false;
    const viewport = createViewport(651);
    const { getByLabelText } = render(<TestInput />);
    const input = getByLabelText('field');
    const scrollIntoView = placeInput(input, 348);

    fireEvent.focus(input);
    viewport.height = 331;
    viewport.dispatchEvent(new Event('resize'));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('calls the passed focus and blur handlers', () => {
    createViewport(651);
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { getByLabelText } = render(
      <TestInput
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    const input = getByLabelText('field');

    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
