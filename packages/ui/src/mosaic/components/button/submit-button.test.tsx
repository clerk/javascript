import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SubmitButton } from './submit-button';

/** The spinner is decorative, so it has no role or name to query — only its slot class. */
const spinner = () => document.querySelector('.cl-spinner');
const content = () => screen.getByRole('button').firstElementChild;

/**
 * StyleX classes, as a set. Which atoms carry which declaration is an implementation detail, so
 * the visual assertions below compare one state's atoms against another's rather than naming any.
 */
const atoms = (el: Element | null | undefined) => el?.className.split(' ').filter(Boolean) ?? [];
const isSupersetOf = (all: string[], some: string[]) => some.every(atom => all.includes(atom));

describe('Mosaic SubmitButton', () => {
  it('renders a submit button with its children', () => {
    render(<SubmitButton>Save</SubmitButton>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('cl-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('lets the consumer override the type', () => {
    render(<SubmitButton type='button'>Save</SubmitButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  // The wrapper is not an implementation detail a consumer can ignore — it is the box their
  // children actually land in — so it carries a slot class they can target.
  it('names the content box with a slot class', () => {
    render(<SubmitButton>Save</SubmitButton>);
    expect(content()).toHaveClass('cl-button-content');
  });

  it('boxes every child in one content span', () => {
    render(
      <SubmitButton>
        <svg data-testid='icon' />
        Save
      </SubmitButton>,
    );
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(1);
    expect(content()?.tagName).toBe('SPAN');
    expect(content()).toContainElement(screen.getByTestId('icon'));
    expect(button).toHaveAccessibleName('Save');
  });

  it('still gives a text run its own box to truncate against', () => {
    render(<SubmitButton>Save</SubmitButton>);
    const label = content()?.firstElementChild;
    expect(label?.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('Save');
  });

  it('renders no spinner and announces nothing while idle', () => {
    render(<SubmitButton>Save</SubmitButton>);
    const button = screen.getByRole('button');
    expect(spinner()).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-busy');
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toHaveAttribute('data-pending');
  });

  it('keeps the focusable-disabled marking when the button is disabled but not pending', () => {
    render(
      <SubmitButton
        disabled
        focusableWhenDisabled
      >
        Save
      </SubmitButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).not.toHaveAttribute('aria-busy');
  });

  it('renders the spinner and reflects the pending state', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const button = screen.getByRole('button');
    expect(spinner()).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-pending', '');
  });

  // The indicator is only decorative when nothing depends on it being announced; here it is the
  // sole signal that the action is running, so it has to reach the accessibility tree.
  it('puts the indicator in the accessibility tree as an indeterminate progressbar', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const bar = screen.getByRole('progressbar', { name: 'pending' });
    expect(bar).toBe(spinner());
    expect(bar).not.toHaveAttribute('aria-hidden');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('lets the consumer name the indicator', () => {
    render(
      <SubmitButton
        isPending
        pendingLabel='Saving'
      >
        Save
      </SubmitButton>,
    );
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeInTheDocument();
  });

  // Fading the label rather than unmounting it keeps the button named for the whole action. The
  // indicator is named separately: a `progressbar` descendant is a range role, so the name
  // computation reads its value rather than its label and it contributes nothing here.
  it('keeps the button named by its own label while pending', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    expect(screen.getByRole('button')).toHaveAccessibleName('Save');
  });

  // The whole point of fading the label rather than swapping it out: the button keeps the
  // width its content gives it, so nothing around it reflows when the state flips.
  it('keeps the label mounted while pending so the button holds its width', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    expect(content()).toHaveTextContent('Save');
  });

  // `aria-disabled` rather than the `disabled` attribute: the button stays focusable, so focus
  // isn't dropped mid-action just as the progressbar is announced.
  it('marks itself disabled to assistive tech while pending but stays focusable', async () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();

    await userEvent.tab();
    expect(button).toHaveFocus();
  });

  it('does not submit its form while pending', async () => {
    const onSubmit = vi.fn(event => event.preventDefault());
    const onClick = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <SubmitButton
          isPending
          onClick={onClick}
        >
          Save
        </SubmitButton>
      </form>,
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits its form once it is no longer pending', async () => {
    const onSubmit = vi.fn(event => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SubmitButton>Save</SubmitButton>
      </form>,
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders the spinner after the content so it can center over the whole button', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button.children).toHaveLength(2);
    expect(button.lastElementChild).toBe(spinner());
  });

  it.each([
    ['sm', 'sm'],
    ['md', 'md'],
    ['lg', 'md'],
  ] as const)('sizes the spinner to %s with the %s step', (size, expected) => {
    render(
      <SubmitButton
        isPending
        size={size}
      >
        Save
      </SubmitButton>,
    );
    expect(spinner()).toHaveAttribute('data-size', expected);
  });

  it('wires the button variant props and consumer className/style through', () => {
    render(
      <SubmitButton
        color='negative'
        variant='outline'
        size='sm'
        fullWidth
        className='my-button'
        style={{ marginTop: '8px' }}
      >
        Save
      </SubmitButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-color', 'negative');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-full-width', '');
    expect(button).toHaveClass('cl-button', 'my-button');
    expect(button).toHaveStyle({ marginTop: '8px' });
  });

  it('keeps the isPending prop off the element', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('ispending');
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<SubmitButton onClick={onClick}>Save</SubmitButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards arbitrary button props and the ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <SubmitButton
        ref={ref}
        form='profile'
      >
        Save
      </SubmitButton>,
    );
    const button = screen.getByRole('button');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('form', 'profile');
  });
});

// The pending *state* is immediate — it has to be, or a fast action could be submitted twice and
// assistive tech would miss it. Only the pixels are delayed, so an action that resolves in a
// couple of frames never flashes a spinner at all.
describe('Mosaic SubmitButton spin delay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  it('marks itself pending immediately, before the spinner is due to show', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-pending', '');
  });

  // `opacity`, not conditional rendering: the indicator has to be in the accessibility tree the
  // moment the action starts, whether or not it is on screen yet.
  it('mounts the indicator immediately and reveals it once the delay elapses', () => {
    render(<SubmitButton isPending>Save</SubmitButton>);
    const hidden = atoms(spinner());
    expect(screen.getByRole('progressbar', { name: 'pending' })).toBeInTheDocument();

    advance(300);
    const shown = atoms(spinner());
    expect(hidden.length).toBeGreaterThan(shown.length);
    expect(isSupersetOf(hidden, shown)).toBe(true);
  });

  it('keeps the label at full opacity until the spinner shows', () => {
    const { rerender } = render(<SubmitButton>Save</SubmitButton>);
    const idle = atoms(content());

    rerender(<SubmitButton isPending>Save</SubmitButton>);
    expect(atoms(content())).toEqual(idle);

    advance(300);
    const faded = atoms(content());
    expect(faded.length).toBeGreaterThan(idle.length);
    expect(isSupersetOf(faded, idle)).toBe(true);
  });

  it('never shows a spinner for an action that finishes inside the delay window', () => {
    const { rerender } = render(<SubmitButton>Save</SubmitButton>);
    const idle = atoms(content());

    rerender(<SubmitButton isPending>Save</SubmitButton>);
    advance(200);
    rerender(<SubmitButton>Save</SubmitButton>);
    advance(1000);

    expect(spinner()).not.toBeInTheDocument();
    expect(atoms(content())).toEqual(idle);
  });

  it('lets the consumer lengthen the delay', () => {
    render(
      <SubmitButton
        isPending
        spinDelay={{ delay: 1000 }}
      >
        Save
      </SubmitButton>,
    );
    const hidden = atoms(spinner());

    advance(300);
    expect(atoms(spinner())).toEqual(hidden);

    advance(700);
    expect(atoms(spinner()).length).toBeLessThan(hidden.length);
  });

  // A consumer who already knows the action is slow has nothing to gain by waiting.
  it('lets the consumer opt out of the delay', () => {
    render(
      <SubmitButton
        isPending
        spinDelay={{ delay: 0 }}
      >
        Save
      </SubmitButton>,
    );
    const hidden = atoms(spinner());

    advance(0);
    expect(atoms(spinner()).length).toBeLessThan(hidden.length);
  });

  it('keeps the default minimum duration when only the delay is overridden', () => {
    const { rerender } = render(
      <SubmitButton
        isPending
        spinDelay={{ delay: 0 }}
      >
        Save
      </SubmitButton>,
    );
    advance(0);

    rerender(<SubmitButton spinDelay={{ delay: 0 }}>Save</SubmitButton>);
    expect(spinner()).toBeInTheDocument();

    advance(200);
    expect(spinner()).not.toBeInTheDocument();
  });

  it('lets the consumer drop the minimum duration', () => {
    const { rerender } = render(
      <SubmitButton
        isPending
        spinDelay={{ delay: 0, minDuration: 0 }}
      >
        Save
      </SubmitButton>,
    );
    advance(0);

    rerender(<SubmitButton spinDelay={{ delay: 0, minDuration: 0 }}>Save</SubmitButton>);
    expect(spinner()).not.toBeInTheDocument();
  });

  // Otherwise an action that resolves just after the spinner appears would flash it off again.
  it('holds the spinner on screen briefly after the action finishes', () => {
    const { rerender } = render(<SubmitButton isPending>Save</SubmitButton>);
    advance(300);
    const shown = atoms(spinner());

    rerender(<SubmitButton>Save</SubmitButton>);
    expect(atoms(spinner())).toEqual(shown);

    advance(200);
    expect(spinner()).not.toBeInTheDocument();
  });
});
