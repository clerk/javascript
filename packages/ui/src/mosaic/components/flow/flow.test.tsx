import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Flow } from './flow';

describe('Mosaic Flow', () => {
  it('renders only the controlled step', () => {
    const { rerender } = render(
      <Flow.Root
        value='password'
        state={{ label: 'Password' }}
        data-testid='root'
      >
        {state => (
          <>
            <Flow.Step ids={['password', 'password-pending']}>{state.label}</Flow.Step>
            <Flow.Step ids={['otp']}>OTP</Flow.Step>
          </>
        )}
      </Flow.Root>,
    );

    const root = screen.getByTestId('root');
    expect(root).toHaveClass('cl-flow-root');
    expect(root).toHaveAttribute('data-value', 'password');
    expect(screen.getByText('Password')).toHaveClass('cl-flow-step');
    expect(screen.getByText('Password')).toHaveAttribute('data-open');
    expect(screen.queryByText('OTP')).not.toBeInTheDocument();

    rerender(
      <Flow.Root
        value='password-pending'
        state={{ label: 'Verifying password' }}
        data-testid='root'
      >
        {state => (
          <>
            <Flow.Step ids={['password', 'password-pending']}>{state.label}</Flow.Step>
            <Flow.Step ids={['otp']}>OTP</Flow.Step>
          </>
        )}
      </Flow.Root>,
    );

    expect(screen.getByTestId('root')).toBe(root);
    expect(root).toHaveAttribute('data-value', 'password-pending');
    expect(screen.getByText('Verifying password')).toHaveAttribute('data-step', 'password');
    expect(screen.getByText('Verifying password')).toHaveAttribute('data-open');

    rerender(
      <Flow.Root
        value='otp'
        direction={-1}
        state={{ label: 'Ignored' }}
        data-testid='root'
      >
        {state => (
          <>
            <Flow.Step ids={['password', 'password-pending']}>{state.label}</Flow.Step>
            <Flow.Step ids={['otp']}>OTP</Flow.Step>
          </>
        )}
      </Flow.Root>,
    );

    expect(screen.queryByText('Verifying password')).not.toBeInTheDocument();
    expect(screen.getByText('OTP')).toHaveAttribute('data-step', 'otp');
    expect(screen.getByText('OTP')).toHaveAttribute('data-open');
    expect(screen.getByText('OTP').style.getPropertyValue('--cl-flow-transition-direction')).toBe('-1');
  });
});
