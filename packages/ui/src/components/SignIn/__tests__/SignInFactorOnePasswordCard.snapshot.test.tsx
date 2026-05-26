import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { SignInFactorOnePasswordCard } from '../SignInFactorOnePasswordCard';

describe('SignInFactorOnePasswordCard snapshots', () => {
  const defaultProps = {
    onForgotPasswordMethodClick: vi.fn() as any,
    onShowAlternativeMethodsClick: vi.fn() as any,
    onAttemptPassword: vi.fn().mockResolvedValue(undefined),
    onGoBack: vi.fn(),
    identifier: 'user@example.com',
    avatarUrl: undefined,
    hasResetPasswordFactor: false,
  };

  it('renders default state', () => {
    const { container } = renderForSnapshot(<SignInFactorOnePasswordCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with alternative methods link', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOnePasswordCard
        {...defaultProps}
        onShowAlternativeMethodsClick={vi.fn() as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders without alternative methods (having trouble)', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOnePasswordCard
        {...defaultProps}
        onShowAlternativeMethodsClick={undefined}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with reset password factor', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOnePasswordCard
        {...defaultProps}
        hasResetPasswordFactor={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with identifier', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOnePasswordCard
        {...defaultProps}
        identifier='hello@clerk.dev'
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
