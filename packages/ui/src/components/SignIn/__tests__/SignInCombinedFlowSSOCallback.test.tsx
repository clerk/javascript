import type { HandleOAuthCallbackParams, SignInResource, SignUpResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { PathRouter } from '../../../router';
import { SignIn } from '../index';

vi.mock('@clerk/shared/internal/clerk-js/protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';

const { createFixtures } = bindCreateFixtures('SignIn');

const mockExecute = executeProtectCheck as unknown as ReturnType<typeof vi.fn>;

const signInProtectCheckFallbackUrl = `${window.location.origin}/sign-in#/protect-check`;

type Fixtures = Awaited<ReturnType<typeof createFixtures>>['fixtures'];

const setup = async (opts: { pendingOAuthTransfer?: boolean; gatedSignUp?: boolean } = {}) => {
  const { wrapper, fixtures, props } = await createFixtures(f => {
    f.withEmailAddress();
    f.withSocialProvider({ provider: 'google' });
    f.withPasskey();
    f.withPasskeySettings({ allow_autofill: true, show_sign_in_button: false });
    if (opts.gatedSignUp) {
      f.startSignUpWithProtectCheck();
      return;
    }
    f.startSignInWithProtectCheck(
      opts.pendingOAuthTransfer ? { pendingOAuthTransfer: true, status: 'needs_identifier' } : undefined,
    );
  });
  props.setProps({ routing: 'path', path: '/sign-in', withSignUp: true } as any);

  // @ts-expect-error - This is not a public API
  fixtures.clerk.__internal_isWebAuthnAutofillSupported = () => Promise.resolve(true);
  fixtures.signIn.authenticateWithPasskey.mockReturnValue(new Promise(() => {}));
  vi.mocked(fixtures.clerk.navigate).mockImplementation((to: string) => {
    const url = new URL(to, window.location.href);
    if (url.origin === window.location.origin) {
      window.history.pushState({}, '', url.href);
    }
    return Promise.resolve();
  });
  vi.mocked(fixtures.clerk.handleRedirectCallback).mockImplementation(
    async (params: HandleOAuthCallbackParams, navigate?: (to: string) => Promise<unknown>) =>
      navigate!(params.signInProtectCheckUrl || signInProtectCheckFallbackUrl),
  );

  return { wrapper, fixtures };
};

const renderAtCallback = (wrapper: React.FC<{ children: React.ReactNode }>) => {
  window.history.replaceState({}, '', '/sign-in/create/sso-callback');
  return render(
    <React.Suspense fallback={null}>
      <PathRouter basePath='/sign-in'>
        <SignIn />
      </PathRouter>
    </React.Suspense>,
    { wrapper },
  );
};

const expectNoReplacementSignIn = (fixtures: Fixtures) => {
  expect(fixtures.signIn.authenticateWithPasskey).not.toHaveBeenCalled();
  expect(fixtures.signIn.create).not.toHaveBeenCalled();
};

describe('SignIn combined-flow SSO callback gated by a Protect check', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue('proof-abc');
  });

  it('runs the challenge for the signed-in OAuth attempt and activates the session', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'complete',
      protectCheck: null,
      createdSessionId: 'sess_1',
    } as unknown as SignInResource);

    renderAtCallback(wrapper);

    await waitFor(() => {
      expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    });
    await waitFor(() => {
      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_1' }));
    });
    expect(window.location.pathname).toBe('/sign-in/protect-check');
    expectNoReplacementSignIn(fixtures);
  });

  it('continues to the second factor after the challenge', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'needs_second_factor',
      protectCheck: null,
      createdSessionId: null,
    } as unknown as SignInResource);

    renderAtCallback(wrapper);

    await waitFor(() => {
      expect(fixtures.clerk.navigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-in\/factor-two/),
        expect.anything(),
      );
    });
    expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    expectNoReplacementSignIn(fixtures);
  });

  it('continues an incomplete OAuth transfer inside the embedded sign-up routes', async () => {
    const { wrapper, fixtures } = await setup({ pendingOAuthTransfer: true });
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'needs_identifier',
      protectCheck: null,
      createdSessionId: null,
      firstFactorVerification: { status: 'transferable' },
    } as unknown as SignInResource);
    vi.mocked(fixtures.clerk.__internal_resumeAfterProtectCheck).mockImplementation(
      async (params: HandleOAuthCallbackParams = {}, navigate?: (to: string) => Promise<unknown>) =>
        navigate!(params.continueSignUpUrl!),
    );

    renderAtCallback(wrapper);

    await waitFor(() => {
      expect(fixtures.clerk.navigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-in\/create\/continue/),
        expect.anything(),
      );
    });
    expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    expectNoReplacementSignIn(fixtures);
  });

  it('resumes an existing-account transfer after the embedded sign-up challenge', async () => {
    const { wrapper, fixtures } = await setup({ gatedSignUp: true });
    vi.mocked(fixtures.clerk.handleRedirectCallback).mockImplementation(
      async (params: HandleOAuthCallbackParams, navigate?: (to: string) => Promise<unknown>) =>
        navigate!(params.signUpProtectCheckUrl!),
    );
    fixtures.signUp.submitProtectCheck.mockResolvedValue({
      status: 'missing_requirements',
      missingFields: ['email_address', 'password'],
      unverifiedFields: [],
      protectCheck: null,
      createdSessionId: null,
      verifications: {
        externalAccount: {
          status: 'transferable',
          strategy: 'oauth_google',
          error: { code: 'external_account_exists' },
        },
      },
    } as unknown as SignUpResource);

    renderAtCallback(wrapper);

    await waitFor(() => {
      expect(fixtures.clerk.__internal_resumeAfterProtectCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          firstFactorUrl: '../../factor-one',
          secondFactorUrl: '../../factor-two',
          resetPasswordUrl: '../../reset-password',
          signInProtectCheckUrl: '../../protect-check',
        }),
        expect.any(Function),
      );
    });
    expect(window.location.pathname).toBe('/sign-in/create/protect-check');
    expect(fixtures.signUp.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    expectNoReplacementSignIn(fixtures);
  });
});
