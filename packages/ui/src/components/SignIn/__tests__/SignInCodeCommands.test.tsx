import type { SignInResource } from '@clerk/shared/types';
import type { ComponentType, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';

import { CardStateProvider } from '../../../elements/contexts';
import { localizationKeys } from '../../../localization';
import { useSignInFactorOneCodeFormModel } from '../sign-in-factor-one-code-form.model';
import { useSignInFactorTwoCodeFormModel } from '../sign-in-factor-two-code-form.model';

vi.mock('../../../hooks', async () => ({
  ...(await vi.importActual('../../../hooks')),
  useFetch: vi.fn(),
}));

const withCard = (Wrapper: ComponentType<PropsWithChildren>) =>
  function CardWrapper({ children }: PropsWithChildren) {
    return (
      <Wrapper>
        <CardStateProvider>{children}</CardStateProvider>
      </Wrapper>
    );
  };

const { createFixtures } = bindCreateFixtures('SignIn');

const codeProps = () => ({
  factor: { strategy: 'phone_code' as const, phoneNumberId: 'idn_phone', safeIdentifier: '+1234567890' },
  factorAlreadyPrepared: false,
  onFactorPrepare: vi.fn(),
  cardTitle: localizationKeys('signIn.phoneCode.title'),
  cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
  inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
  resendButton: localizationKeys('signIn.phoneCode.resendButton'),
  identityPreviewEditButtonAriaLabel: localizationKeys('identityPreviewEditButton__phoneNumber'),
});

describe('Sign-in code commands', () => {
  it('returns a completion command and uses the returned session after the code card resolves', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber();
      f.startSignInWithPhoneNumber({ supportPhoneCode: true });
    });
    fixtures.signIn.attemptFirstFactor.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_result',
    } as SignInResource);
    const props = codeProps();
    const { result } = renderHook(
      () => {
        const model = useSignInFactorOneCodeFormModel(props);
        return { model, controller: { action: useCodeSubmissionController(model) } };
      },
      { wrapper: withCard(wrapper) },
    );
    let resolveCard!: () => void;
    const cardResolved = new Promise<void>(resolve => {
      resolveCard = resolve;
    });
    const reject = vi.fn();
    await act(async () => {
      const complete = await result.current.model.attempt('123456');
      expect(typeof complete).toBe('function');
      expect(complete).not.toHaveProperty('createdSessionId');
      result.current.controller.action('654321', () => cardResolved, reject);
    });
    await waitFor(() => expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalledTimes(2));
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    await act(() => {
      resolveCard();
    });
    await waitFor(() =>
      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_result' })),
    );
    expect(reject).not.toHaveBeenCalled();
  });

  it('handles a Protect prepare result privately and delays attempt navigation until completion', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const gated = { status: 'needs_protect_check', protectCheck: { status: 'pending' } } as SignInResource;
    fixtures.signIn.prepareFirstFactor.mockResolvedValue(gated);
    fixtures.signIn.attemptFirstFactor.mockResolvedValue(gated);
    const props = codeProps();
    const { result } = renderHook(() => useSignInFactorOneCodeFormModel(props), { wrapper: withCard(wrapper) });
    await act(async () => {
      expect(await result.current.prepareRequest()).toBeUndefined();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
    expect(props.onFactorPrepare).not.toHaveBeenCalled();
    vi.mocked(fixtures.router.navigate).mockClear();
    await act(async () => {
      const complete = await result.current.attempt('123456');
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
      await complete();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('uses the returned reset-password state for second-factor completion', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInFactorTwo();
    });
    fixtures.signIn.attemptSecondFactor.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_reset',
      firstFactorVerification: { strategy: 'reset_password_email_code', status: 'verified' },
    } as SignInResource);
    const { result } = renderHook(() => useSignInFactorTwoCodeFormModel(codeProps()), { wrapper: withCard(wrapper) });
    expect(result.current.resettingPassword).toBe(false);
    await act(async () => {
      const complete = await result.current.attempt('123456');
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
      await complete();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../reset-password-success?createdSessionId=sess_reset');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });
});
