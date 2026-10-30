import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProviderButton, ProviderButtonGroup } from '../index';

const googleProps = {
  icon: <svg data-testid='icon' />,
  longLabel: 'Continue with Google',
  shortLabel: 'Google',
};

const spinner = () => document.querySelector('.cl-spinner');
const iconBox = () => screen.getByTestId('icon').parentElement;

describe('Mosaic ProviderButton', () => {
  it('renders a neutral outline button that does not submit forms', () => {
    render(<ProviderButton {...googleProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-color', 'neutral');
    expect(button).toHaveAttribute('data-variant', 'outline');
  });

  it('is named by the long label', () => {
    render(<ProviderButton {...googleProps} />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Continue with Google');
  });

  it('forwards its ref and other button props', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <ProviderButton
        {...googleProps}
        ref={ref}
        onClick={onClick}
      />,
    );
    screen.getByRole('button').click();
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders no spinner while idle', () => {
    render(<ProviderButton {...googleProps} />);
    expect(spinner()).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  describe('while pending', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('goes inert and announces busy immediately, but stays focusable', () => {
      render(
        <ProviderButton
          {...googleProps}
          isPending
        />,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-pending');
      expect(screen.getByRole('progressbar', { name: 'pending' })).toBeInTheDocument();
    });

    it('swaps the icon for the spinner only after the delay, and keeps the labels', () => {
      render(
        <ProviderButton
          {...googleProps}
          isPending
        />,
      );
      const idleClass = iconBox()?.className;
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(iconBox()?.className).not.toBe(idleClass);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('does not draw the spinner for an action that ends before the delay', () => {
      const { rerender } = render(
        <ProviderButton
          {...googleProps}
          isPending
        />,
      );
      const hiddenClass = iconBox()?.className;
      act(() => {
        vi.advanceTimersByTime(100);
      });
      rerender(<ProviderButton {...googleProps} />);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(spinner()).not.toBeInTheDocument();
      expect(iconBox()?.className).toBe(hiddenClass);
    });

    it('takes a custom pending label', () => {
      render(
        <ProviderButton
          {...googleProps}
          isPending
          pendingLabel='Connecting'
        />,
      );
      expect(screen.getByRole('progressbar', { name: 'Connecting' })).toBeInTheDocument();
    });
  });

  it('does not fire clicks while pending', async () => {
    const onClick = vi.fn();
    render(
      <ProviderButton
        {...googleProps}
        isPending
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'), { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Mosaic ProviderButtonGroup', () => {
  it('defaults to the inline layout', () => {
    render(<ProviderButtonGroup data-testid='group' />);
    expect(screen.getByTestId('group')).toHaveClass('cl-provider-button-group');
    expect(screen.getByTestId('group')).toHaveAttribute('data-layout', 'inline');
  });

  it('takes the stacked layout', () => {
    render(
      <ProviderButtonGroup
        data-testid='group'
        layout='stacked'
      />,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-layout', 'stacked');
  });

  it('keeps a pending button focusable while the group is disabled', () => {
    render(
      <ProviderButtonGroup disabled>
        <ProviderButton
          {...googleProps}
          isPending
        />
      </ProviderButtonGroup>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
  });

  it('disables every button', () => {
    render(
      <ProviderButtonGroup disabled>
        <ProviderButton {...googleProps} />
        <ProviderButton
          {...googleProps}
          longLabel='Continue with GitHub'
          shortLabel='GitHub'
        />
      </ProviderButtonGroup>,
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});
