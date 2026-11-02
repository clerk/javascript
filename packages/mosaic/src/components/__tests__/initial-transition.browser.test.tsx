import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Card } from '../card';
import { Field } from '../field';
import { Section } from '../section';

afterEach(() => cleanup());

const cases = [
  {
    name: 'section error',
    property: 'height',
    renderMessage: (message: string) => <Section.Error>{message}</Section.Error>,
  },
  {
    name: 'card banner',
    property: 'grid-template-rows',
    renderMessage: (message: string) => <Card.Banner role='alert'>{message}</Card.Banner>,
  },
];

describe.each(cases)('$name motion', ({ property, renderMessage }) => {
  it('shows an initial message without animating its layout', async () => {
    render(renderMessage('Something went wrong.'));
    const message = screen.getByRole('alert');

    expect(getComputedStyle(message).transitionProperty).toBe(property);
    expect(getComputedStyle(message).transitionDuration).not.toBe('0s');
    expect(message.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(
      message
        .getAnimations({ subtree: true })
        .map(animation =>
          animation instanceof CSSTransition ? animation.transitionProperty : animation.constructor.name,
        ),
    ).toEqual([]);

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(message.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it('animates a message that arrives after mount', async () => {
    const { rerender } = render(renderMessage(''));

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    rerender(renderMessage('Something went wrong.'));
    const message = screen.getByRole('alert');
    expect(message.getBoundingClientRect().height).toBe(0);

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(
      message
        .getAnimations()
        .some(animation => animation instanceof CSSTransition && animation.transitionProperty === property),
    ).toBe(true);
  });
});

it('animates field feedback opening, resizing, closing, and reopening', async () => {
  const renderMessage = (text: string) => (
    <div style={{ width: 180 }}>
      <Field.Message>
        <Field.Error>{text}</Field.Error>
      </Field.Message>
    </div>
  );
  const { rerender } = render(renderMessage(''));
  const message = screen.getByRole('status');
  expect(message.getBoundingClientRect().height).toBe(0);
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  rerender(renderMessage('Invalid email.'));
  await waitFor(() =>
    expect(
      message
        .getAnimations()
        .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height'),
    ).toBe(true),
  );
  await waitFor(() => expect(message.getAnimations({ subtree: true })).toHaveLength(0));
  const shortHeight = message.getBoundingClientRect().height;
  expect(shortHeight).toBeGreaterThan(0);

  rerender(renderMessage('This email address is invalid. Enter a complete email address before continuing.'));
  await waitFor(() =>
    expect(
      message
        .getAnimations()
        .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height'),
    ).toBe(true),
  );
  await waitFor(() => expect(message.getAnimations({ subtree: true })).toHaveLength(0));
  expect(message.getBoundingClientRect().height).toBeGreaterThan(shortHeight);

  rerender(renderMessage(''));
  await waitFor(() =>
    expect(
      message
        .getAnimations()
        .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height'),
    ).toBe(true),
  );
  await waitFor(() => expect(message.getBoundingClientRect().height).toBe(0));
  await waitFor(() => expect(screen.queryByText(/This email address is invalid/)).toBeNull());

  rerender(renderMessage('Invalid email.'));
  await waitFor(() =>
    expect(
      message
        .getAnimations()
        .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height'),
    ).toBe(true),
  );
  await waitFor(() => expect(message.getAnimations({ subtree: true })).toHaveLength(0));
  expect(message.getBoundingClientRect().height).toBe(shortHeight);
});
