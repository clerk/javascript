import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource, SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook, waitFor } from '@/test/utils';
import { useSignInFactorOneCodeFormModel } from '@/ui/components/SignIn/sign-in-factor-one-code-form.model';
import { useSignInFactorTwoCodeFormModel } from '@/ui/components/SignIn/sign-in-factor-two-code-form.model';
import { useSignUpEmailCodeCardModel } from '@/ui/components/SignUp/sign-up-email-code-card.model';
import { useSignUpPhoneCodeCardModel } from '@/ui/components/SignUp/sign-up-phone-code-card.model';
import { localizationKeys } from '@/ui/localization';

const props = () => ({
  factor: { strategy: 'phone_code' as const, phoneNumberId: 'phone_1', safeIdentifier: '+1•••1234' },
  factorAlreadyPrepared: true,
  onFactorPrepare: vi.fn(),
  cardTitle: localizationKeys('signIn.phoneCode.title'),
  cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
  inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
  resendButton: localizationKeys('signIn.phoneCode.resendButton'),
  identityPreviewEditButtonAriaLabel: localizationKeys('identityPreviewEditButton__phoneNumber'),
});
const scenarios = [
  {
    name: 'sign-in first factor',
    flow: 'signIn' as const,
    method: 'attemptFirstFactor' as const,
    useModel: () => useSignInFactorOneCodeFormModel(props()),
  },
  {
    name: 'sign-in second factor',
    flow: 'signIn' as const,
    method: 'attemptSecondFactor' as const,
    useModel: () => useSignInFactorTwoCodeFormModel(props()),
  },
  {
    name: 'sign-up email',
    flow: 'signUp' as const,
    method: 'attemptEmailAddressVerification' as const,
    useModel: useSignUpEmailCodeCardModel,
  },
  {
    name: 'sign-up phone',
    flow: 'signUp' as const,
    method: 'attemptPhoneNumberVerification' as const,
    useModel: useSignUpPhoneCodeCardModel,
  },
];
const response = { status: 'complete', createdSessionId: 'session_result' } as SignInResource & SignUpResource;

describe.each(scenarios)('$name completion ownership', ({ flow, method, useModel }) => {
  const setup = async () => {
    const { createFixtures } = bindCreateFixtures(flow === 'signIn' ? 'SignIn' : 'SignUp');
    const { wrapper, fixtures, props: fixtureProps } = await createFixtures();
    fixtureProps.setProps({ forceRedirectUrl: '/done' });
    const resource = flow === 'signIn' ? fixtures.signIn : fixtures.signUp;
    resource.id = 'attempt_1';
    const sdk = vi.spyOn(resource as never, method as never).mockResolvedValue(response as never);
    const hook = renderHook(useModel, { wrapper });
    return { ...hook, fixtures, resource, sdk };
  };

  it('blocks a retained SDK attempt after closure', async () => {
    const { result, sdk, unmount } = await setup();
    const previous = result.current.attempt;
    unmount();
    const complete = await previous('123456');
    await complete();
    expect(sdk).not.toHaveBeenCalled();
  });

  it('discards a pending result after closure', async () => {
    const { result, sdk, fixtures, unmount } = await setup();
    const request = createDeferredPromise<SignInResource & SignUpResource>();
    sdk.mockReturnValue(request.promise as never);
    const pending = result.current.attempt('123456');
    unmount();
    request.resolve(response);
    const complete = await pending;
    await complete();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('blocks a returned completion after another attempt takes ownership before render', async () => {
    const { result, fixtures, resource } = await setup();
    const complete = await result.current.attempt('123456');
    resource.id = 'attempt_2';
    await complete();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('suppresses a pending SDK error after ownership is lost', async () => {
    const { result, sdk, fixtures, resource } = await setup();
    const request = createDeferredPromise<SignInResource & SignUpResource>();
    sdk.mockReturnValue(request.promise as never);
    const pending = result.current.attempt('123456');
    resource.id = 'attempt_2';
    request.reject(new Error('Late failure'));
    const complete = await pending;
    await complete();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('preserves SDK errors for the current owner', async () => {
    const { result, sdk } = await setup();
    const error = new Error('Invalid code');
    sdk.mockRejectedValue(error as never);
    await expect(result.current.attempt('123456')).rejects.toBe(error);
  });

  it('finishes an activation redirect after activation replaces the session and closes the form', async () => {
    const { result, fixtures, unmount } = await setup();
    const activation = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockImplementation(async options => {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ id: 'session_result' } as never);
      await activation.promise;
      await options?.navigate?.({
        session: { id: 'session_result', currentTask: null } as never,
        decorateUrl: url => url,
      });
    });
    const complete = await result.current.attempt('123456');
    const pending = complete();
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(1));
    unmount();
    activation.resolve();
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith(new URL('/done', window.location.href).href);
  });

  if (flow === 'signIn') {
    it('does not return a recovery command for an obsolete attempt', async () => {
      const { result, resource } = await setup();
      resource.id = 'attempt_2';
      const error = new ClerkAPIResponseError('Locked', {
        status: 403,
        data: [{ code: 'user_locked', message: 'Locked' }],
      });
      expect('getErrorRecovery' in result.current && result.current.getErrorRecovery(error)).toBeUndefined();
    });
  }
});
