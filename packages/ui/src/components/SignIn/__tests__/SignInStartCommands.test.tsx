import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import type { ComponentType, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { CardStateProvider } from '../../../elements/contexts';
import { useSignInStartController } from '../sign-in-start.controller';
import { useSignInStartModel } from '../sign-in-start.model';

const { createFixtures } = bindCreateFixtures('SignIn');

const withCard = (Wrapper: ComponentType<PropsWithChildren>) =>
  function CardWrapper({ children }: PropsWithChildren) {
    return (
      <Wrapper>
        <CardStateProvider>{children}</CardStateProvider>
      </Wrapper>
    );
  };

describe('Sign-in start commands', () => {
  it('does not start passkey autofill after its capability check settles on an unmounted form', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.environment.userSettings.passkeySettings.allow_autofill = true;
    fixtures.environment.userSettings.attributes.passkey.enabled = true;
    let resolveSupport!: (supported: boolean) => void;
    const support = new Promise<boolean>(resolve => {
      resolveSupport = resolve;
    });
    const checkSupport = vi.fn(() => support);
    Object.assign(fixtures.clerk, { __internal_isWebAuthnAutofillSupported: checkSupport });
    const { unmount } = renderHook(() => useSignInStartController(useSignInStartModel()), {
      wrapper: withCard(wrapper),
    });
    expect(checkSupport).toHaveBeenCalledOnce();
    unmount();
    await act(async () => {
      resolveSupport(true);
      await support;
    });
    expect(fixtures.signIn.authenticateWithPasskey).not.toHaveBeenCalled();
  });

  it('builds channel fields privately and preserves the supplied fields', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withPhoneNumber();
    });
    fixtures.environment.authConfig.preferredChannels = { US: 'whatsapp' };
    fixtures.signIn.create.mockResolvedValue({ status: 'needs_second_factor' } as SignInResource);
    const { result } = renderHook(() => useSignInStartModel(), { wrapper: withCard(wrapper) });
    const fields = [{ id: 'identifier', value: '+14155552671', type: 'tel' }];
    await act(async () => {
      expect(await result.current.submit(fields, {})).toBeUndefined();
    });
    expect(fixtures.signIn.create).toHaveBeenCalledWith({
      identifier: '+14155552671',
      strategy: 'phone_code',
      channel: 'whatsapp',
    });
    expect(fields).toEqual([{ id: 'identifier', value: '+14155552671', type: 'tel' }]);
    expect(fixtures.router.navigate).toHaveBeenCalledWith('factor-two');
    await act(async () => {
      expect(await result.current.submit(fields, { channel: 'sms' })).toBeUndefined();
    });
    expect(fixtures.signIn.create).toHaveBeenLastCalledWith({
      identifier: '+14155552671',
      strategy: 'phone_code',
      channel: 'sms',
    });
  });

  it('uses the returned SSO-capable sign-in for a permitted password attempt', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEnterpriseSso();
    });
    const attemptFirstFactor = vi
      .fn()
      .mockResolvedValue({ status: 'complete', createdSessionId: 'sess_password_result' });
    fixtures.signIn.create.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }],
      attemptFirstFactor,
    } as unknown as SignInResource);
    const { result } = renderHook(() => useSignInStartModel(), { wrapper: withCard(wrapper) });
    await act(async () => {
      expect(
        await result.current.submit(
          [
            { id: 'identifier', value: 'user@example.com', type: 'text' },
            { id: 'password', name: 'password', value: 'password', type: 'password' },
          ],
          {},
        ),
      ).toBeUndefined();
    });
    expect(fixtures.signIn.create).toHaveBeenCalledWith({ identifier: 'user@example.com' });
    expect(attemptFirstFactor).toHaveBeenCalledWith({ strategy: 'password', password: 'password' });
    expect(fixtures.signIn.attemptFirstFactor).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_password_result' }));
  });

  it('routes a gated ticket result without exposing the resource or activating a session', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.signIn.create.mockResolvedValue({
      status: 'needs_protect_check',
      protectCheck: { status: 'pending' },
    } as SignInResource);
    const { result } = renderHook(() => useSignInStartModel(), { wrapper: withCard(wrapper) });
    await act(async () => {
      expect(await result.current.createTicketSignIn('ticket')).toBeUndefined();
    });
    expect(fixtures.signIn.create).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'ticket' });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('protect-check');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(result.current).not.toHaveProperty('activateSession');
  });

  it('returns recovery decisions and keeps session recovery private', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.clerk.client.lastActiveSessionId = 'sess_existing';
    const { result } = renderHook(() => useSignInStartModel(), { wrapper: withCard(wrapper) });
    const apiError = (code: string) =>
      new ClerkAPIResponseError('Error', {
        data: [{ code, message: 'Error', long_message: 'Error' }],
        status: 400,
      });
    await act(async () => {
      expect(
        await result.current.recoverSignInError(apiError('form_password_incorrect'), {
          type: 'text',
          value: 'user@example.com',
        }),
      ).toBe('retry_identifier');
      expect(
        await result.current.recoverSignInError(apiError('session_exists'), {
          type: 'text',
          value: 'user@example.com',
        }),
      ).toBe('handled');
      expect(
        await result.current.recoverSignInError(apiError('identifier_already_signed_in'), {
          type: 'text',
          value: 'user@example.com',
        }),
      ).toBe('unhandled');
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_existing' }));
  });

  it('discards the reset resource and copies display settings', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.signIn.create.mockResolvedValue(fixtures.signIn);
    const { result } = renderHook(() => useSignInStartModel(), { wrapper: withCard(wrapper) });
    result.current.standardFormAttributes.push('passkey');
    expect(fixtures.environment.userSettings.enabledFirstFactorIdentifiers).not.toContain('passkey');
    await act(async () => {
      expect(await result.current.clearFirstFactorError()).toBeUndefined();
    });
    expect(fixtures.signIn.create).toHaveBeenCalledWith({});
  });
});
