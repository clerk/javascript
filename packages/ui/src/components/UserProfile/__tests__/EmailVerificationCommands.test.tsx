import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useEmailFormModel } from '../email-form.model';
import type { EmailVerificationProps } from '../email-form.types';
import { useEmailVerificationController } from '../email-verification.controller';
import { VerifyWithEnterpriseConnection } from '../VerifyWithEnterpriseConnection';

const { createFixtures } = bindCreateFixtures('UserProfile');

function Verification(props: EmailVerificationProps) {
  const controller = useEmailVerificationController(props);
  return (
    <button
      type='button'
      onClick={controller.startVerification}
    >
      Retry
    </button>
  );
}

describe('Email verification commands', () => {
  it('creates a private email-link flow only when requested and discards its resource result', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    const email = fixtures.clerk.user!.emailAddresses[0];
    const startEmailLinkFlow = vi.fn().mockResolvedValue(email);
    const cancelEmailLinkFlow = vi.fn();
    email.createEmailLinkFlow.mockReturnValue({ startEmailLinkFlow, cancelEmailLinkFlow });
    const { result } = renderHook(() => useEmailFormModel({ emailId: email.id }), { wrapper });

    expect(result.current).not.toHaveProperty('emailAddress');
    expect(email.createEmailLinkFlow).not.toHaveBeenCalled();
    const flow = result.current.createEmailLinkFlow();
    await act(async () => {
      expect(await flow.start()).toBeUndefined();
    });
    expect(startEmailLinkFlow).toHaveBeenCalledWith({ redirectUrl: expect.stringContaining('/verify') });
    flow.cancel();
    expect(cancelEmailLinkFlow).toHaveBeenCalledOnce();
  });

  it('opens the redirect URL from the private SSO email resource', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    const email = fixtures.clerk.user!.emailAddresses[0];
    email.verification.externalVerificationRedirectURL = new URL('https://idp.example.com/verify');
    const startEnterpriseSSOLinkFlow = vi.fn().mockResolvedValue(email);
    const cancelEnterpriseSSOLinkFlow = vi.fn();
    email.createEnterpriseSSOLinkFlow.mockReturnValue({ startEnterpriseSSOLinkFlow, cancelEnterpriseSSOLinkFlow });
    const { result } = renderHook(() => useEmailFormModel({ emailId: email.id }), { wrapper });
    expect(email.createEnterpriseSSOLinkFlow).not.toHaveBeenCalled();
    const flow = result.current.createEnterpriseSSOLinkFlow();
    await act(async () => {
      expect(await flow.start()).toBeUndefined();
      expect(await flow.open?.()).toBeUndefined();
    });
    expect(startEnterpriseSSOLinkFlow).toHaveBeenCalledWith({ redirectUrl: window.location.href });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('https://idp.example.com/verify');
    flow.cancel();
    expect(cancelEnterpriseSSOLinkFlow).toHaveBeenCalledOnce();
  });

  it('cancels on unmount and ignores a late verification completion', async () => {
    const { wrapper } = await createFixtures();
    let finish!: () => void;
    const cancel = vi.fn();
    const start = vi.fn().mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        }),
    );
    const nextStep = vi.fn();
    const { unmount } = render(
      <CardStateProvider>
        <VerifyWithEnterpriseConnection
          createFlow={() => ({ start, cancel })}
          nextStep={nextStep}
          onReset={vi.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );
    await waitFor(() => expect(start).toHaveBeenCalledOnce());
    unmount();
    expect(cancel).toHaveBeenCalledOnce();
    await act(() => finish());
    expect(nextStep).not.toHaveBeenCalled();
  });

  it('advances only for the latest verification attempt', async () => {
    const { wrapper } = await createFixtures();
    const completions: Array<() => void> = [];
    const start = vi.fn().mockImplementation(
      () =>
        new Promise<void>(resolve => {
          completions.push(resolve);
        }),
    );
    const cancels = [vi.fn(), vi.fn()];
    let flowIndex = 0;
    const nextStep = vi.fn();
    const { userEvent, getByRole, unmount } = render(
      <CardStateProvider>
        <Verification
          createFlow={() => ({ start, cancel: cancels[flowIndex++] })}
          nextStep={nextStep}
          onReset={vi.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );
    await waitFor(() => expect(start).toHaveBeenCalledOnce());
    await userEvent.click(getByRole('button', { name: 'Retry' }));
    expect(cancels[0]).toHaveBeenCalledOnce();
    expect(cancels[1]).not.toHaveBeenCalled();
    await act(() => completions[0]());
    expect(nextStep).not.toHaveBeenCalled();
    await act(() => completions[1]());
    expect(nextStep).toHaveBeenCalledOnce();
    unmount();
    expect(cancels[1]).toHaveBeenCalledOnce();
  });
});
