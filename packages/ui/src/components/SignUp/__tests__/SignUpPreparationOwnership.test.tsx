import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSignUpEmailCodeCardModel } from '../sign-up-email-code-card.model';
import { useSignUpPhoneCodeCardController } from '../sign-up-phone-code-card.controller';
import { useSignUpPhoneCodeCardModel } from '../sign-up-phone-code-card.model';

const { createFixtures } = bindCreateFixtures('SignUp');
const failure = () =>
  new ClerkAPIResponseError('Failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Failed', long_message: 'Please try again' }],
  });
const setup = async (kind: 'email' | 'phone', strict = false, pending = false, alternative = false) => {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    if (kind === 'email') {
      f.withEmailAddress();
      f.startSignUpWithEmailAddress({ supportEmailLink: false, emailVerificationStatus: 'expired' });
    } else {
      f.withPhoneNumber();
      f.startSignUpWithPhoneNumber();
    }
  });
  const verification =
    kind === 'email' ? fixtures.signUp.verifications.emailAddress : fixtures.signUp.verifications.phoneNumber;
  verification.status = pending ? 'unverified' : 'expired';
  verification.strategy = kind === 'email' ? 'email_code' : 'phone_code';
  if (alternative) {
    fixtures.signUp.verifications.phoneNumber.channel = 'whatsapp';
  }
  const method = kind === 'email' ? 'prepareEmailAddressVerification' : 'preparePhoneNumberVerification';
  const sdk = vi.spyOn(fixtures.signUp, method);
  const request = createDeferredPromise<SignUpResource>();
  sdk.mockReturnValue(request.promise);
  const Content = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const wrapper = ({ children }: PropsWithChildren) =>
    strict ? (
      <StrictMode>
        <Content>{children}</Content>
      </StrictMode>
    ) : (
      <Content>{children}</Content>
    );
  const useModel = kind === 'email' ? useSignUpEmailCodeCardModel : useSignUpPhoneCodeCardModel;
  const hook = renderHook(
    () => {
      const model = useModel();
      return { model, controller: useCodePreparationController(model), card: useCardState() };
    },
    { wrapper },
  );
  return { ...hook, wrapper, fixtures, sdk, request };
};

describe.each(['email', 'phone'] as const)('Sign-up %s preparation ownership', kind => {
  it('automatically prepares once under Strict Mode', async () => {
    const { sdk, request } = await setup(kind, true);
    await waitFor(() => expect(sdk).toHaveBeenCalledTimes(1));
    await act(async () => {
      request.resolve({} as SignUpResource);
      await request.promise;
    });
    expect(sdk).toHaveBeenCalledTimes(1);
  });

  it('blocks duplicate resends before render', async () => {
    const { result, sdk, request } = await setup(kind, false, true);
    act(() => {
      void result.current.controller.prepare();
      void result.current.controller.prepare();
    });
    expect(sdk).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve({} as SignUpResource);
      await request.promise;
    });
  });

  it('ignores a late error when the active attempt changes before render', async () => {
    const { result, sdk, request, fixtures } = await setup(kind);
    await waitFor(() => expect(sdk).toHaveBeenCalledTimes(1));
    fixtures.signUp.id = 'sua_other';
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    expect(result.current.card.error).toBeUndefined();
  });

  it('blocks a retained resend after the contact address changes before render', async () => {
    const { result, sdk, fixtures } = await setup(kind, false, true);
    if (kind === 'email') {
      fixtures.signUp.emailAddress = 'other@example.com';
    } else {
      fixtures.signUp.phoneNumber = '+12025550123';
    }
    await result.current.controller.prepare();
    expect(sdk).not.toHaveBeenCalled();
  });

  it('blocks a retained model command after unmount', async () => {
    const { result, sdk, unmount } = await setup(kind, false, true);
    const prepare = result.current.model.prepareRequest;
    unmount();
    await prepare();
    expect(sdk).not.toHaveBeenCalled();
  });

  it('preserves a preparation error for the current card', async () => {
    const { result, sdk, request } = await setup(kind);
    await waitFor(() => expect(sdk).toHaveBeenCalledTimes(1));
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    expect(result.current.card.error).toBe('Please try again');
  });
});

describe('Alternative phone provider preparation', () => {
  it('skips the automatic send and keeps explicit SMS fallback available', async () => {
    const { wrapper, sdk, request } = await setup('phone', false, false, true);
    const { result } = renderHook(
      () => {
        const model = useSignUpPhoneCodeCardModel();
        return useSignUpPhoneCodeCardController(model);
      },
      { wrapper },
    );
    expect(sdk).not.toHaveBeenCalled();
    act(() => {
      result.current.prepareWithSMS();
      result.current.prepareWithSMS();
    });
    expect(sdk).toHaveBeenCalledExactlyOnceWith({ strategy: 'phone_code', channel: undefined });
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      request.resolve({} as SignUpResource);
      await request.promise;
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
