import type { SignUpResource } from '@clerk/shared/types';
import type { ComponentType, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { CardStateProvider } from '../../../elements/contexts';
import { useSignUpEmailCodeCardModel } from '../sign-up-email-code-card.model';
import { useSignUpPhoneCodeCardModel } from '../sign-up-phone-code-card.model';

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

const { createFixtures } = bindCreateFixtures('SignUp');

describe('Sign-up code commands', () => {
  it('keeps email verification resources private until completion is requested', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const resource = { status: 'complete', createdSessionId: 'sess_email_result' } as SignUpResource;
    fixtures.signUp.prepareEmailAddressVerification.mockResolvedValue(resource);
    fixtures.signUp.attemptEmailAddressVerification.mockResolvedValue(resource);
    const { result } = renderHook(() => useSignUpEmailCodeCardModel(), { wrapper: withCard(wrapper) });
    await act(async () => {
      expect(await result.current.prepareRequest()).toBeUndefined();
      const complete = await result.current.attempt('123456');
      expect(typeof complete).toBe('function');
      expect(complete).not.toHaveProperty('createdSessionId');
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await complete();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_email_result' }));
  });

  it('discards phone prepare results and completes with the returned sign-up', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const resource = { status: 'complete', createdSessionId: 'sess_phone_result' } as SignUpResource;
    fixtures.signUp.preparePhoneNumberVerification.mockResolvedValue(resource);
    fixtures.signUp.attemptPhoneNumberVerification.mockResolvedValue(resource);
    const { result } = renderHook(() => useSignUpPhoneCodeCardModel(), { wrapper: withCard(wrapper) });
    await act(async () => {
      expect(await result.current.prepareRequest()).toBeUndefined();
      expect(await result.current.prepareSMSRequest()).toBeUndefined();
      const complete = await result.current.attempt('123456');
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await complete();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_phone_result' }));
  });
});
