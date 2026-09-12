import { act, cleanup, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Flow, useFlowAutoFocus } from './index';

function AutoFocusInput(props: React.ComponentProps<'input'>) {
  return (
    <input
      ref={useFlowAutoFocus()}
      {...props}
    />
  );
}

interface TestFlowProps {
  value: string;
  direction?: -1 | 1;
  passwordContent?: string;
}

function TestFlow({ value, direction = 1, passwordContent = 'Password' }: TestFlowProps) {
  return (
    <Flow.Root
      value={value}
      direction={direction}
      data-testid='flow-root'
    >
      <Flow.Step
        ids={['password', 'password-pending', 'password-error']}
        data-testid='password-step'
      >
        {passwordContent}
        <AutoFocusInput data-testid='password-input' />
      </Flow.Step>
      <Flow.Step
        ids={['otp', 'otp-pending', 'otp-error']}
        data-testid='otp-step'
      >
        OTP
        <AutoFocusInput data-testid='otp-input' />
      </Flow.Step>
    </Flow.Root>
  );
}

describe('Flow', () => {
  let rafCallbacks: Array<FrameRequestCallback>;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(callback => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });
    globalThis.cancelAnimationFrame = vi.fn(id => {
      rafCallbacks[id - 1] = () => {};
    });
  });

  afterEach(() => {
    cleanup();
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  function flushRaf() {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach(callback => callback(performance.now()));
  }

  it('renders only the step matching the controlled value', () => {
    render(<TestFlow value='password' />);

    expect(screen.getByTestId('password-step')).toHaveTextContent('Password');
    expect(screen.queryByTestId('otp-step')).not.toBeInTheDocument();
  });

  it('keeps the same step mounted when the value changes within its ids', () => {
    const { rerender } = render(<TestFlow value='password' />);
    const step = screen.getByTestId('password-step');

    rerender(<TestFlow value='password-pending' />);

    expect(screen.getByTestId('password-step')).toBe(step);
    expect(step).toHaveAttribute('data-open');
    expect(step).not.toHaveAttribute('data-ending-style');
  });

  it('does not animate the initially active step', () => {
    render(<TestFlow value='password' />);

    const step = screen.getByTestId('password-step');
    expect(step).toHaveAttribute('data-open');
    expect(step).not.toHaveAttribute('data-starting-style');
  });

  it('keeps the outgoing step mounted, inert, and frozen while it exits', async () => {
    let finishAnimation!: () => void;
    const animationFinished = new Promise<void>(resolve => {
      finishAnimation = resolve;
    });
    const { rerender } = render(
      <TestFlow
        value='password'
        passwordContent='Entered password'
      />,
    );
    const outgoingStep = screen.getByTestId('password-step');
    outgoingStep.getAnimations = vi.fn(() => [{ finished: animationFinished }] as unknown as Animation[]);

    rerender(
      <TestFlow
        value='otp'
        passwordContent='Cleared password'
      />,
    );

    expect(outgoingStep).toHaveAttribute('data-closed');
    expect(outgoingStep).toHaveAttribute('data-ending-style');
    expect(outgoingStep).toHaveAttribute('inert');
    expect(outgoingStep).toHaveAttribute('aria-hidden', 'true');
    expect(outgoingStep).toHaveTextContent('Entered password');

    const incomingStep = screen.getByTestId('otp-step');
    expect(incomingStep).toHaveAttribute('data-open');
    expect(incomingStep).toHaveAttribute('data-starting-style');
    expect(incomingStep).not.toHaveAttribute('inert');

    outgoingStep.getAnimations = vi.fn(() => []);
    await act(async () => {
      finishAnimation();
      await animationFinished;
    });

    expect(screen.queryByTestId('password-step')).not.toBeInTheDocument();
  });

  it('exposes direction as a numeric CSS variable on entering and exiting steps', () => {
    let finishAnimation!: () => void;
    const animationFinished = new Promise<void>(resolve => {
      finishAnimation = resolve;
    });
    const { rerender } = render(<TestFlow value='password' />);
    const outgoingStep = screen.getByTestId('password-step');
    outgoingStep.getAnimations = vi.fn(() => [{ finished: animationFinished }] as unknown as Animation[]);

    rerender(
      <TestFlow
        value='otp'
        direction={-1}
      />,
    );

    expect(outgoingStep.style.getPropertyValue('--cl-flow-transition-direction')).toBe('-1');
    expect(screen.getByTestId('otp-step').style.getPropertyValue('--cl-flow-transition-direction')).toBe('-1');

    outgoingStep.getAnimations = vi.fn(() => []);
    finishAnimation();
  });

  it('keeps the returning step mounted when its exit is interrupted', async () => {
    let finishAnimation!: () => void;
    const animationFinished = new Promise<void>(resolve => {
      finishAnimation = resolve;
    });
    const { rerender } = render(<TestFlow value='password' />);
    const step = screen.getByTestId('password-step');
    step.getAnimations = vi.fn(() => [{ finished: animationFinished }] as unknown as Animation[]);

    rerender(<TestFlow value='otp' />);
    expect(step).toHaveAttribute('data-ending-style');

    rerender(
      <TestFlow
        value='password'
        direction={-1}
      />,
    );
    act(() => flushRaf());

    expect(step).toHaveAttribute('data-open');
    expect(step).not.toHaveAttribute('data-ending-style');

    step.getAnimations = vi.fn(() => []);
    await act(async () => {
      finishAnimation();
      await animationFinished;
    });

    expect(screen.getByTestId('password-step')).toBe(step);
    expect(step).not.toHaveAttribute('data-starting-style');
  });

  it('forwards its ref and supports a custom rendered element', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Flow.Root value='password'>
        <Flow.Step
          ids={['password']}
          ref={ref}
          render={<section data-testid='custom-step' />}
        >
          Password
        </Flow.Step>
      </Flow.Root>,
    );

    expect(screen.getByTestId('custom-step').tagName).toBe('SECTION');
    expect(ref.current).toBe(screen.getByTestId('custom-step'));
  });

  it('throws when a step is rendered outside the root', () => {
    expect(() => render(<Flow.Step ids={['password']}>Password</Flow.Step>)).toThrow(
      'Flow compound components must be used within <Flow.Root>',
    );
  });

  it('publishes the entering step height without enabling initial animation', () => {
    const offsetHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.testid === 'password-step' ? 120 : 240;
    });
    const { rerender } = render(<TestFlow value='password' />);
    const root = screen.getByTestId('flow-root');

    expect(root.style.getPropertyValue('--cl-flow-step-height')).toBe('120px');
    expect(root).toHaveAttribute('data-initial');

    act(() => flushRaf());

    expect(root).not.toHaveAttribute('data-initial');

    rerender(<TestFlow value='otp' />);

    expect(root.style.getPropertyValue('--cl-flow-step-height')).toBe('240px');
    expect(root).not.toHaveAttribute('data-initial');
    offsetHeight.mockRestore();
  });
  describe('useFlowAutoFocus', () => {
    let originalGetAnimations: HTMLElement['getAnimations'] | undefined;

    beforeEach(() => {
      originalGetAnimations = HTMLElement.prototype.getAnimations;
    });

    afterEach(() => {
      if (originalGetAnimations) {
        HTMLElement.prototype.getAnimations = originalGetAnimations;
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
      }
    });

    function pendingAnimationOn(testid: string) {
      let finishAnimation!: () => void;
      const animationFinished = new Promise<void>(resolve => {
        finishAnimation = resolve;
      });
      let finished = false;
      HTMLElement.prototype.getAnimations = function (this: HTMLElement) {
        if (finished || this.dataset.testid !== testid) {
          return [];
        }
        return [{ finished: animationFinished }] as unknown as Animation[];
      };
      return async () => {
        finished = true;
        await act(async () => {
          finishAnimation();
          await animationFinished;
        });
      };
    }

    it('does not focus the initially active step', () => {
      render(<TestFlow value='password' />);

      expect(screen.getByTestId('password-input')).not.toHaveFocus();
    });

    it('focuses the registered element once the entering step settles', async () => {
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      const finish = pendingAnimationOn('otp-step');
      const { rerender } = render(<TestFlow value='password' />);

      rerender(<TestFlow value='otp' />);
      const input = screen.getByTestId('otp-input');
      expect(input).not.toHaveFocus();

      act(() => flushRaf());
      await act(async () => {});
      expect(input).not.toHaveFocus();

      await finish();

      expect(input).toHaveFocus();
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      focus.mockRestore();
    });

    it('focuses immediately after the starting frame when the step has no animations', async () => {
      HTMLElement.prototype.getAnimations = () => [];
      const { rerender } = render(<TestFlow value='password' />);

      rerender(<TestFlow value='otp' />);
      expect(screen.getByTestId('otp-input')).not.toHaveFocus();

      act(() => flushRaf());
      await act(async () => {});

      expect(screen.getByTestId('otp-input')).toHaveFocus();
    });

    it('leaves focus alone when it is outside the flow', async () => {
      HTMLElement.prototype.getAnimations = () => [];
      const { rerender } = render(
        <>
          <button
            type='button'
            data-testid='outside'
          >
            Outside
          </button>
          <TestFlow value='password' />
        </>,
      );
      screen.getByTestId('outside').focus();

      rerender(
        <>
          <button
            type='button'
            data-testid='outside'
          >
            Outside
          </button>
          <TestFlow value='otp' />
        </>,
      );
      act(() => flushRaf());
      await act(async () => {});

      expect(screen.getByTestId('outside')).toHaveFocus();
      expect(screen.getByTestId('otp-input')).not.toHaveFocus();
    });

    it('abandons a pending focus when the entering step closes before it settles', async () => {
      const finish = pendingAnimationOn('otp-step');
      const { rerender } = render(<TestFlow value='password' />);

      rerender(<TestFlow value='otp' />);
      const otpInput = screen.getByTestId('otp-input');

      rerender(
        <TestFlow
          value='password'
          direction={-1}
        />,
      );
      act(() => flushRaf());
      await act(async () => {});
      await finish();

      expect(otpInput).not.toHaveFocus();
      expect(screen.getByTestId('password-input')).toHaveFocus();
    });

    it('focuses the first marked element in DOM order when several are marked', async () => {
      HTMLElement.prototype.getAnimations = () => [];
      const otpStep = (
        <Flow.Step ids={['otp']}>
          <AutoFocusInput data-testid='first' />
          <AutoFocusInput data-testid='second' />
        </Flow.Step>
      );
      const { rerender } = render(
        <Flow.Root value='password'>
          <Flow.Step ids={['password']}>Password</Flow.Step>
          {otpStep}
        </Flow.Root>,
      );

      rerender(
        <Flow.Root value='otp'>
          <Flow.Step ids={['password']}>Password</Flow.Step>
          {otpStep}
        </Flow.Root>,
      );
      act(() => flushRaf());
      await act(async () => {});

      expect(screen.getByTestId('first')).toHaveFocus();
    });

    it('focuses whichever marked element is still mounted when the step settles', async () => {
      const finish = pendingAnimationOn('otp-step');
      const otpStep = (showFirst: boolean) => (
        <Flow.Step
          ids={['otp']}
          data-testid='otp-step'
        >
          {showFirst ? <AutoFocusInput data-testid='first' /> : null}
          <AutoFocusInput data-testid='second' />
        </Flow.Step>
      );
      const { rerender } = render(
        <Flow.Root value='password'>
          <Flow.Step ids={['password']}>Password</Flow.Step>
          {otpStep(true)}
        </Flow.Root>,
      );

      rerender(
        <Flow.Root value='otp'>
          <Flow.Step ids={['password']}>Password</Flow.Step>
          {otpStep(true)}
        </Flow.Root>,
      );
      rerender(
        <Flow.Root value='otp'>
          <Flow.Step ids={['password']}>Password</Flow.Step>
          {otpStep(false)}
        </Flow.Root>,
      );
      act(() => flushRaf());
      await act(async () => {});
      await finish();

      expect(screen.queryByTestId('first')).not.toBeInTheDocument();
      expect(screen.getByTestId('second')).toHaveFocus();
    });

    it('returns a no-op ref outside a step', () => {
      expect(() => render(<AutoFocusInput data-testid='lone-input' />)).not.toThrow();
      expect(screen.getByTestId('lone-input')).toBeInTheDocument();
    });
  });
});
