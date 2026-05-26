import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { SignInFactorTwoBackupCodeCard } from '../SignInFactorTwoBackupCodeCard';

describe('SignInFactorTwoBackupCodeCard snapshots', () => {
  const defaultProps = {
    onShowAlternativeMethodsClicked: vi.fn() as any,
    onAttemptBackupCode: vi.fn().mockResolvedValue(undefined),
    isResettingPassword: false,
  };

  it('renders default state', () => {
    const { container } = renderForSnapshot(<SignInFactorTwoBackupCodeCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with reset password subtitle', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoBackupCodeCard
        {...defaultProps}
        isResettingPassword={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
