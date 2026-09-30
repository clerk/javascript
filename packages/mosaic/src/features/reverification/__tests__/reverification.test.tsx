import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor, mockActor } from '../../../machine/createActor';
import { Reverification } from '../reverification';
import { RESEND_COOLDOWN_MS, type ReverificationContext, reverificationMachine } from '../reverification.machine';
import type { ReverificationMethod, ReverificationViewProps } from '../reverification.types';

let viewProps: ReverificationViewProps | undefined;

vi.mock('../reverification.view', () => ({
  ReverificationPending: () => <output data-testid='pending' />,
  ReverificationUnavailable: () => <output data-testid='unavailable' />,
  ReverificationView: (props: ReverificationViewProps) => {
    viewProps = props;
    return <output data-testid='view'>{props.step}</output>;
  },
}));

vi.mock('../../../hooks/useMosaicSupportEmail', () => ({
  useMosaicSupportEmail: () => 'support@example.com',
}));

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };
const email: ReverificationMethod = {
  id: 'email_code:ema_1',
  stage: 'first',
  strategy: 'email_code',
  emailAddressId: 'ema_1',
  identifier: 'a***@example.com',
};

function at(value: string, context: Partial<ReverificationContext> = {}) {
  return mockActor(reverificationMachine, {
    value,
    context: { activeMethod: password, methods: [password, email], ...context },
  });
}

function view(): ReverificationViewProps {
  if (!viewProps) {
    throw new Error('view was not rendered');
  }
  return viewProps;
}

describe('Reverification', () => {
  it('renders nothing without a reverification actor', () => {
    const { container } = render(<Reverification actor={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an actor of another machine', () => {
    const other = createActor(reverificationMachine);
    const { container } = render(<Reverification actor={{ ...other }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders pending while starting and unavailable when there is no method', () => {
    const { rerender } = render(<Reverification actor={at('starting', { activeMethod: null })} />);
    expect(screen.getByTestId('pending')).toBeInTheDocument();

    rerender(<Reverification actor={at('unavailable')} />);
    expect(screen.getByTestId('unavailable')).toBeInTheDocument();
  });

  it('shows the pending card when verification completes without a factor', () => {
    render(<Reverification actor={at('finishing', { activeMethod: null })} />);
    expect(screen.getByTestId('pending')).toBeInTheDocument();
  });

  it.each([
    ['factor.editing.ready', 'password'],
    ['factor.help', 'help'],
    ['methods.list', 'method-picker'],
    ['methods.preparing', 'method-picker'],
    ['methods.help', 'help'],
  ])('maps %s to the %s step', (value, step) => {
    render(<Reverification actor={at(value)} />);
    expect(screen.getByTestId('view')).toHaveTextContent(step);
  });

  it('maps the active method to its factor step and otp channel', () => {
    render(<Reverification actor={at('factor.editing.ready', { activeMethod: email })} />);

    expect(screen.getByTestId('view')).toHaveTextContent('otp');
    expect(view().otpChannel).toBe('email');
    expect(view().methods).toEqual([password]);
  });

  it.each([
    ['factor.editing.ready', false],
    ['factor.editing.preparing.queued', false],
    ['factor.submitting', true],
    ['finishing', true],
    ['verified', true],
  ])('in %s the factor pending flag is %s', (value, isPending) => {
    render(<Reverification actor={at(value)} />);
    expect(view().isPending).toBe(isPending);
  });

  it('keeps the picked method as the sending row while it prepares', () => {
    render(<Reverification actor={at('methods.preparing', { pendingMethod: email })} />);

    expect(view().pendingMethodId).toBe(email.id);
    expect(view().methods).toEqual([email]);
  });

  it('counts down the resend cooldown', () => {
    vi.useFakeTimers();
    try {
      const resendAvailableAt = Date.now() + RESEND_COOLDOWN_MS;
      render(<Reverification actor={at('factor.editing.ready', { activeMethod: email, resendAvailableAt })} />);
      expect(view().canResend).toBe(false);
      expect(view().resendRemainingSeconds).toBe(30);

      act(() => {
        vi.advanceTimersByTime(RESEND_COOLDOWN_MS);
      });

      expect(view().canResend).toBe(true);
      expect(view().resendRemainingSeconds).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('sends view callbacks to the actor', () => {
    const actor = at('factor.editing.ready');
    render(<Reverification actor={actor} />);

    act(() => view().onValueChange('hunter2'));

    expect(actor.getSnapshot().context.inputValue).toBe('hunter2');
  });
});
