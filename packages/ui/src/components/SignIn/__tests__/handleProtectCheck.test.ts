import type { ProtectCheckResource, SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { isSignInProtectGated, navigateOnSignInProtectGate } from '../handleProtectCheck';

const PENDING_CHECK: ProtectCheckResource = {
  status: 'pending',
  token: 'challenge-token',
  sdkUrl: 'https://protect.example.com/sdk.js',
};

const asSignIn = (partial: Partial<SignInResource>): SignInResource => partial as unknown as SignInResource;

describe('isSignInProtectGated', () => {
  it('is true when the protectCheck field is present', () => {
    expect(isSignInProtectGated(asSignIn({ status: 'needs_first_factor', protectCheck: PENDING_CHECK }))).toBe(true);
  });

  it("is true when the status is 'needs_protect_check' (SDK-version-gated signal)", () => {
    expect(isSignInProtectGated(asSignIn({ status: 'needs_protect_check', protectCheck: null }))).toBe(true);
  });

  it('is false when neither signal is present', () => {
    expect(isSignInProtectGated(asSignIn({ status: 'needs_first_factor', protectCheck: null }))).toBe(false);
  });
});

describe('navigateOnSignInProtectGate', () => {
  it('navigates to the provided path and returns true when gated by the protectCheck field', () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    const handled = navigateOnSignInProtectGate(
      asSignIn({ status: 'needs_first_factor', protectCheck: PENDING_CHECK }),
      navigate,
      '../protect-check',
    );

    expect(handled).toBe(true);
    expect(navigate).toHaveBeenCalledWith('../protect-check');
  });

  it("navigates and returns true when gated by the 'needs_protect_check' status", () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    const handled = navigateOnSignInProtectGate(
      asSignIn({ status: 'needs_protect_check', protectCheck: null }),
      navigate,
      'protect-check',
    );

    expect(handled).toBe(true);
    expect(navigate).toHaveBeenCalledWith('protect-check');
  });

  it('honors the per-caller path verbatim (index mount vs factor mount)', () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    navigateOnSignInProtectGate(asSignIn({ protectCheck: PENDING_CHECK }), navigate, 'protect-check');
    expect(navigate).toHaveBeenCalledWith('protect-check');
  });

  it('does not navigate and returns false when not gated', () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    const handled = navigateOnSignInProtectGate(
      asSignIn({ status: 'needs_first_factor', protectCheck: null }),
      navigate,
      '../protect-check',
    );

    expect(handled).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
