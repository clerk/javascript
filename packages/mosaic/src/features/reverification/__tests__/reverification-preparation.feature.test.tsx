import { reverificationError } from '@clerk/shared/authorization-errors';
import { ClerkWebAuthnError } from '@clerk/shared/error';
import type { VerificationJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import type { FakeVerificationSeed } from '../../../__tests__/feature/fake-fapi/verification';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiSession,
  fapiSessionVerification,
  fapiUser,
  fapiVerification,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Card } from '../../../components/card';
import { Reverification, useReverificationFlow } from '../reverification';

const PREPARE_FIRST = '/v1/client/sessions/sess_1/verify/prepare_first_factor';
const EMAIL_STEP = 'Enter the code sent to your email to continue';
const PASSWORD_STEP = 'Enter your current password to continue';
const CODE = '123456';
const PHONE_CODE = '234567';
const WORK_CODE = '654321';
const EMAIL_METHOD = 'Email code to alice@example.com';
const PHONE_METHOD = 'Send SMS code to +1 555 0100';
const PHONE_STEP = 'Enter the code sent to your phone to continue';
const PREPARE_SECOND = '/v1/client/sessions/sess_1/verify/prepare_second_factor';
const emailFactor = {
  strategy: 'email_code',
  email_address_id: 'idn_alice',
  safe_identifier: 'alice@example.com',
} as const;
const passwordFactor = { strategy: 'password' } as const;
const phoneFactor = { strategy: 'phone_code', phone_number_id: 'idn_phone', safe_identifier: '+1 555 0100' } as const;
const workFactor = {
  strategy: 'email_code',
  email_address_id: 'idn_work',
  safe_identifier: 'alice@work.example',
} as const;

function Host({ action }: { action: () => Promise<unknown> }) {
  const [run, controller] = useReverificationFlow(action);
  const [outcome, setOutcome] = useState('');
  return (
    <>
      <button
        type='button'
        onClick={() =>
          void run().then(
            () => setOutcome('resolved'),
            () => setOutcome('rejected'),
          )
        }
      >
        Run action
      </button>
      <output aria-label='Outcome'>{outcome}</output>
      <Card.Root renderBranding={false}>
        <Reverification controller={controller} />
        {controller.onCancel ? (
          <button
            type='button'
            onClick={controller.onCancel}
          >
            Dismiss
          </button>
        ) : null}
      </Card.Root>
    </>
  );
}

async function renderPreparation(
  action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true }),
  verification: FakeVerificationSeed = {},
) {
  const alice = fapiUser({
    email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  });
  const session = fapiSession({ id: 'sess_1', user: alice });
  const fapi = serveFapi({
    client: fapiClient([session]),
    environment: fapiEnvironment({ display_config: { preferred_sign_in_strategy: 'otp' } }),
    verification: {
      firstFactors: [emailFactor, passwordFactor],
      secrets: { email_code: CODE, phone_code: PHONE_CODE, password: 'hunter2', totp: CODE, backup_code: 'backup-1' },
      codesByIdentification: { idn_alice: CODE, idn_work: WORK_CODE, idn_phone: PHONE_CODE },
      ...verification,
    },
  });
  const view = await renderWithClerk(<Host action={action} />);
  return { ...view, fapi, action, session };
}

async function selectMethod(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: 'Use another method' }));
  await user.click(await screen.findByRole('button', { name }));
}

async function pasteCode(user: ReturnType<typeof userEvent.setup>, code: string) {
  const [first] = within(screen.getByRole('group', { name: 'Verification code' })).getAllByRole('textbox');
  if (!first) {
    throw new Error('Missing code input');
  }
  await user.click(first);
  await user.paste(code);
}

async function startPrepared(options: FakeVerificationSeed = {}) {
  const view = await renderPreparation(undefined, options);
  const prepares = holdRequests('post', PREPARE_FIRST);
  prepares.release();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Run action' }));
  await vi.waitFor(() => expect(view.fapi.verification.firstFactorVerification?.strategy).toBe('email_code'));
  return { ...view, prepares, user };
}

describe('Reverification preparation', () => {
  it('reuses the email code after visiting password without attempting it', async () => {
    const { fapi } = await renderPreparation();
    const prepare = holdRequests('post', PREPARE_FIRST);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));
    prepare.release();
    await waitFor(() => expect(fapi.verification.firstFactorVerification?.strategy).toBe('email_code'));
    await selectMethod(user, 'Continue with your password');
    expect(await screen.findByText(PASSWORD_STEP)).toBeVisible();

    const duplicate = holdRequests('post', PREPARE_FIRST);
    await selectMethod(user, 'Email code to alice@example.com');
    await new Promise(resolve => setTimeout(resolve, 100));
    duplicate.release();
    expect(duplicate.requests).toHaveLength(0);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    const [first] = within(screen.getByRole('group', { name: 'Verification code' })).getAllByRole('textbox');
    if (!first) {
      throw new Error('Missing code input');
    }
    await user.click(first);
    await user.paste(CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it('keeps a pending email preparation alive across a visit to password', async () => {
    await renderPreparation();
    const prepare = holdRequests('post', PREPARE_FIRST);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(prepare.requests).toHaveLength(1));
    await selectMethod(user, 'Continue with your password');
    expect(await screen.findByText(PASSWORD_STEP)).toBeVisible();
    await selectMethod(user, 'Email code to alice@example.com');
    await new Promise(resolve => setTimeout(resolve, 100));
    prepare.release();
    expect(prepare.requests).toHaveLength(1);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
  });

  it.each(['sent', 'failed'])(
    'waits for a pending preparation before submitting password when the send is %s',
    async result => {
      await renderPreparation();
      const prepare = holdRequests('post', PREPARE_FIRST);
      const attempt = holdRequests('post', '/v1/client/sessions/sess_1/verify/attempt_first_factor');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Run action' }));
      await waitFor(() => expect(prepare.requests).toHaveLength(1));
      await selectMethod(user, 'Continue with your password');
      await user.type(screen.getByLabelText('Password'), 'hunter2{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));
      const prematureAttempts = attempt.requests.length;
      if (result === 'sent') {
        prepare.release();
      } else {
        prepare.fail('preparation_failed', 'Old send failed');
      }
      attempt.release();
      expect(prematureAttempts).toBe(0);
      await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
      expect(attempt.requests).toHaveLength(1);
    },
  );

  it.each(['before', 'after'])('drains a cancelled preparation when the next start is released %s it', async order => {
    await renderPreparation(vi.fn().mockResolvedValue(reverificationError()));
    const oldPrepare = holdRequests('post', PREPARE_FIRST);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(oldPrepare.requests).toHaveLength(1));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('rejected'));
    const start = holdRequests('post', '/v1/client/sessions/sess_1/verify');
    const nextPrepare = holdRequests('post', PREPARE_FIRST);
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await new Promise(resolve => setTimeout(resolve, 100));
    const prematureStarts = start.requests.length;
    if (order === 'before') {
      start.release();
      oldPrepare.release();
    } else {
      oldPrepare.release();
      await waitFor(() => expect(start.requests).toHaveLength(1));
      start.release();
    }
    nextPrepare.release();
    expect(prematureStarts).toBe(0);
    await waitFor(() => expect(nextPrepare.requests).toHaveLength(1));
    expect(start.requests).toHaveLength(1);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
  });

  it.each([10_000, 30_000, 90_000])('preserves the dispatch cooldown when returning after %i ms', async elapsed => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const { prepares, user } = await startPrepared();
      await selectMethod(user, 'Continue with your password');
      await act(() => vi.advanceTimersByTimeAsync(elapsed));
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      expect(prepares.requests).toHaveLength(1);
      const resend = screen.getByRole('button', { name: /Resend/ });
      if (elapsed < 30_000) {
        expect(resend).toBeDisabled();
        expect(resend).toHaveTextContent('Resend (20)');
      } else {
        expect(resend).toBeEnabled();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([0, 1000])('prepares again when returning %i ms after server expiry', async afterExpiry => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const { prepares, user, fapi } = await startPrepared();
      const expiresAt = fapi.verification.firstFactorVerification?.expire_at;
      if (typeof expiresAt !== 'number') {
        throw new Error('Missing server expiry');
      }
      await selectMethod(user, 'Continue with your password');
      vi.setSystemTime(expiresAt + afterExpiry);
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      expect(prepares.requests).toHaveLength(2);
      expect(screen.getByRole('button', { name: /Resend \(30\)/ })).toBeDisabled();
      await pasteCode(user, CODE);
      await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('replaces the sole challenge on email A to B to A and rejects B code on A', async () => {
    const { prepares, user } = await startPrepared({ firstFactors: [emailFactor, workFactor] });
    await selectMethod(user, 'Email code to alice@work.example');
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    await selectMethod(user, EMAIL_METHOD);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    expect(prepares.requests).toHaveLength(3);
    expect(
      await Promise.all(
        prepares.requests.map(async request => new URLSearchParams(await request.text()).get('email_address_id')),
      ),
    ).toEqual(['idn_alice', 'idn_work', 'idn_alice']);
    await pasteCode(user, WORK_CODE);
    expect(await screen.findByText('Incorrect code')).toBeVisible();
    await user.keyboard('{Backspace>6/}');
    await pasteCode(user, CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it.each(['password', 'code'] as const)('prepares again after an unsuccessful %s attempt', async strategy => {
    const { prepares, user } = await startPrepared();
    if (strategy === 'password') {
      await selectMethod(user, 'Continue with your password');
      await user.type(screen.getByLabelText('Password'), 'wrong{Enter}');
      expect(await screen.findByText(/Password is incorrect/)).toBeVisible();
    } else {
      await pasteCode(user, '000000');
      expect(await screen.findByText('Incorrect code')).toBeVisible();
      await selectMethod(user, 'Continue with your password');
    }
    await selectMethod(user, EMAIL_METHOD);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    expect(prepares.requests).toHaveLength(2);
    await pasteCode(user, CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it.each(['totp', 'backup_code'] as const)('reuses SMS after a failed %s attempt', async strategy => {
    const { fapi } = await renderPreparation(undefined, { secondFactors: [phoneFactor, { strategy }] });
    const prepares = holdRequests('post', PREPARE_SECOND);
    prepares.release();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    if (strategy === 'totp') {
      expect(await screen.findByText('Enter the code generated by your authenticator app to continue')).toBeVisible();
      await selectMethod(user, PHONE_METHOD);
    }
    expect(await screen.findByText(PHONE_STEP)).toBeVisible();
    await waitFor(() => expect(fapi.verification.secondFactorVerification?.strategy).toBe('phone_code'));
    await selectMethod(user, strategy === 'totp' ? 'Use your authenticator app' : 'Use a backup code');
    if (strategy === 'totp') {
      await pasteCode(user, '000000');
    } else {
      await user.type(screen.getByRole('textbox'), 'wrong{Enter}');
    }
    expect(await screen.findByText('Incorrect code')).toBeVisible();
    await selectMethod(user, PHONE_METHOD);
    expect(await screen.findByText(PHONE_STEP)).toBeVisible();
    expect(prepares.requests).toHaveLength(1);
    await pasteCode(user, PHONE_CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it('prepares the same phone separately for the first and second factors', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError({ level: 'multi_factor', afterMinutes: 10 }))
      .mockResolvedValue({ done: true });
    await renderPreparation(action, { firstFactors: [phoneFactor], secondFactors: [phoneFactor] });
    const first = holdRequests('post', PREPARE_FIRST);
    const second = holdRequests('post', PREPARE_SECOND);
    first.release();
    second.release();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    expect(await screen.findByText(PHONE_STEP)).toBeVisible();
    await pasteCode(user, PHONE_CODE);
    await waitFor(() => expect(second.requests).toHaveLength(1));
    expect(first.requests).toHaveLength(1);
    await pasteCode(user, PHONE_CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it.each([
    { label: 'missing expiry', value: { expire_at: null } },
    { label: 'invalid expiry', value: { expire_at: Number.MAX_VALUE } },
    { label: 'expired verification', value: { status: 'expired' } },
    { label: 'failed verification', value: { status: 'failed' } },
    { label: 'verified verification', value: { status: 'verified' } },
    { label: 'different strategy', value: { strategy: 'phone_code' } },
  ] satisfies Array<{ label: string; value: Partial<VerificationJSON> }>)(
    'does not reuse $label',
    async ({ value }) => {
      const { fapi, session } = await renderPreparation();
      worker.use(
        http.post(
          fapiUrl(PREPARE_FIRST),
          () => {
            const verification = fapiVerification('email_code', value);
            fapi.verification.firstFactorVerification = verification;
            fapi.verification.firstFactorCode = CODE;
            return HttpResponse.json({
              response: fapiSessionVerification(session, {
                first_factor_verification: verification,
                supported_first_factors: fapi.verification.firstFactors,
              }),
              client: fapi.client,
            });
          },
          { once: true },
        ),
      );
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Run action' }));
      await waitFor(() => expect(fapi.verification.firstFactorVerification).not.toBeNull());
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      await selectMethod(user, 'Continue with your password');
      const next = holdRequests('post', PREPARE_FIRST);
      next.release();
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      expect(next.requests).toHaveLength(1);
      await pasteCode(user, CODE);
      await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
    },
  );

  it('serializes two successful preparations and accepts only the selected destination code', async () => {
    await renderPreparation(undefined, { firstFactors: [emailFactor, workFactor] });
    const first = holdRequests('post', PREPARE_FIRST);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(first.requests).toHaveLength(1));
    const second = holdRequests('post', PREPARE_FIRST);
    await selectMethod(user, 'Email code to alice@work.example');
    await new Promise(resolve => setTimeout(resolve, 100));
    const prematurePrepares = second.requests.length;
    first.release();
    await waitFor(() => expect(second.requests).toHaveLength(1));
    second.release();
    expect(prematurePrepares).toBe(0);
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    await pasteCode(user, CODE);
    expect(await screen.findByText('Incorrect code')).toBeVisible();
    await user.keyboard('{Backspace>6/}');
    await pasteCode(user, WORK_CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it('resends after reusing a valid preparation and recovers when resend fails', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const { prepares, user } = await startPrepared();
      await selectMethod(user, 'Continue with your password');
      await act(() => vi.advanceTimersByTimeAsync(31_000));
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      expect(prepares.requests).toHaveLength(1);
      const resend = holdRequests('post', PREPARE_FIRST);
      await user.click(screen.getByRole('button', { name: 'Resend' }));
      await vi.waitFor(() => expect(resend.requests).toHaveLength(1));
      expect(screen.getByRole('button', { name: /Resend \(30\)/ })).toBeDisabled();
      resend.fail('preparation_failed', 'Resend failed');
      expect(await screen.findByText('Resend failed')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled();
      const retry = holdRequests('post', PREPARE_FIRST);
      retry.release();
      await user.click(screen.getByRole('button', { name: 'Resend' }));
      await vi.waitFor(() => expect(retry.requests).toHaveLength(1));
      expect(screen.queryByText('Resend failed')).toBeNull();
      expect(screen.getByRole('button', { name: /Resend \(30\)/ })).toBeDisabled();
      await pasteCode(user, CODE);
      await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('allows the currently sent code when expiry metadata is absent', async () => {
    const { fapi, session } = await renderPreparation();
    worker.use(
      http.post(
        fapiUrl(PREPARE_FIRST),
        () => {
          const verification = fapiVerification('email_code', { expire_at: null });
          fapi.verification.firstFactorVerification = verification;
          fapi.verification.firstFactorCode = CODE;
          return HttpResponse.json({
            response: fapiSessionVerification(session, {
              first_factor_verification: verification,
              supported_first_factors: fapi.verification.firstFactors,
            }),
            client: fapi.client,
          });
        },
        { once: true },
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    await pasteCode(user, CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it('clears preparation when the host unmounts and mounts again', async () => {
    const { rerender, prepares, user, action } = await startPrepared();
    action.mockResolvedValueOnce(reverificationError());
    rerender(
      <Host
        key='new'
        action={action}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(prepares.requests).toHaveLength(2));
    expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
    await pasteCode(user, CODE);
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
  });

  it('does not start or prepare for a different session while the original preparation drains', async () => {
    const { fapi, clerk } = await renderPreparation();
    const secondSession = fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) });
    fapi.client.sessions.push(secondSession);
    const first = holdRequests('post', PREPARE_FIRST);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run action' }));
    await waitFor(() => expect(first.requests).toHaveLength(1));
    const otherStart = holdRequests('post', '/v1/client/sessions/sess_2/verify');
    otherStart.release();
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('rejected'));
    first.release();
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(otherStart.requests).toHaveLength(0);
    expect(first.requests).toHaveLength(1);
    expect(clerk.session?.id).toBe('sess_2');
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('prepares again after the passkey prompt is aborted', async () => {
    const { clerk } = await renderPreparation(undefined, { firstFactors: [emailFactor, { strategy: 'passkey' }] });
    const credential = vi.fn().mockResolvedValue({
      publicKeyCredential: null,
      error: new ClerkWebAuthnError('Aborted', { code: 'passkey_operation_aborted' }),
    });
    clerk.__internal_getPublicCredentials = credential;
    Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
    try {
      const prepares = holdRequests('post', PREPARE_FIRST);
      prepares.release();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Run action' }));
      expect(await screen.findByText(/Using your passkey confirms/)).toBeVisible();
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      await selectMethod(user, 'Use your passkey');
      await user.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(credential).toHaveBeenCalledOnce());
      await waitFor(() => expect(screen.getByRole('button', { name: 'Use another method' })).toBeEnabled());
      await selectMethod(user, EMAIL_METHOD);
      expect(await screen.findByText(EMAIL_STEP)).toBeVisible();
      expect(
        await Promise.all(
          prepares.requests.map(async request => new URLSearchParams(await request.text()).get('strategy')),
        ),
      ).toEqual(['email_code', 'passkey', 'email_code']);
      await pasteCode(user, CODE);
      await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
    } finally {
      Reflect.deleteProperty(navigator, 'webdriver');
    }
  });
});
