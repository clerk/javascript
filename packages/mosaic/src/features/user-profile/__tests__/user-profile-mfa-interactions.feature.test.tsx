import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileMfaSection } from '../user-profile-mfa-section/user-profile-mfa-section';
import { mfaEnvironment, renderMfa } from './mfa-feature-setup';

describe('User profile MFA interaction boundaries', () => {
  it('restores Add focus after cancelling the method picker', async () => {
    await renderMfa();
    const user = userEvent.setup();
    const add = screen.getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    expect(screen.getByRole('dialog', { name: 'Add 2-step verification' })).toHaveAccessibleDescription(
      'Choose a verification method',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(add).toHaveFocus();
    await user.click(add);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(add).toHaveFocus();
  });

  it('retries failed authenticator preparation and preserves its manual secret and entered code', async () => {
    const fapi = await renderMfa();
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/totp'), () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json(
              { errors: [{ code: 'service_unavailable', message: 'Please try again.' }] },
              { status: 503 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please try again.'));
    const retry = screen.getByRole('button', { name: 'Try again' });
    await waitFor(() => expect(retry).toHaveFocus());
    await user.click(retry);
    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
    const code = screen.getByRole('textbox', { name: 'Verification code' });
    await waitFor(() => expect(code).toHaveFocus());
    await user.type(code, '123');
    const form = code.closest('form');
    if (!form) {
      throw new Error('Verification form missing');
    }
    form.requestSubmit();
    expect(fapi.mfa.totpAttempts).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));
    const secret = screen.getByRole('textbox', { name: 'Setup key' });
    const uri = screen.getByRole('textbox', { name: 'Setup URI' });
    expect(secret).toHaveAttribute('readonly');
    expect(uri).toHaveAttribute('readonly');
    const originalSecret = secret.getAttribute('value');
    await user.click(screen.getByRole('button', { name: 'Scan QR code instead' }));
    expect(screen.getByRole('img', { name: /QR code/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Can’t scan? View setup key' }));
    expect(screen.getByRole('textbox', { name: 'Setup key' })).toHaveAttribute('value', originalSecret);
    expect(screen.getByRole('textbox', { name: 'Verification code' })).toHaveValue('1');
    expect(screen.getByRole('textbox', { name: 'Character 2 of 6' })).toHaveValue('2');
    expect(screen.getByRole('textbox', { name: 'Character 3 of 6' })).toHaveValue('3');
    expect(fapi.mfa.totpCreations).toBe(1);
  });

  it('disables Back while authenticator preparation is pending', async () => {
    await renderMfa();
    const held = holdRequests('post', '/v1/me/totp');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    await waitFor(() => expect(held.requests).toHaveLength(1));
    try {
      await waitFor(() => {
        expect(screen.getByRole('status', { name: 'Preparing authenticator…' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
      });
    } finally {
      held.release();
    }
    expect(await screen.findByRole('img', { name: /QR code/i })).toBeVisible();
  });

  it('focuses SMS selection and new phone entry', async () => {
    await renderMfa();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /SMS verification/ }));
    const selection = screen.getByRole('combobox', { name: /Phone number/ });
    await waitFor(() => expect(selection).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Add a new phone number' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveFocus());
  });

  it('blocks duplicate authenticator verification through the native form while pending', async () => {
    const fapi = await renderMfa();
    const held = holdRequests('post', '/v1/me/totp/attempt_verification');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
    const code = await screen.findByRole('textbox', { name: 'Verification code' });
    await user.type(code, '123456');
    await waitFor(() => expect(held.requests).toHaveLength(1));
    try {
      await waitFor(() => expect(screen.getByRole('progressbar', { name: 'Verifying code' })).toBeVisible());
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
      const form = code.closest('form');
      if (!form) {
        throw new Error('Verification form missing');
      }
      form.requestSubmit();
      expect(held.requests).toHaveLength(1);
      expect(fapi.mfa.totpAttempts).toHaveLength(0);
    } finally {
      held.release();
    }
    await waitFor(() => expect(fapi.mfa.totpAttempts).toEqual(['123456']));
  });

  it('retries failed backup-code generation without exposing an empty save action', async () => {
    serveFapi({
      environment: mfaEnvironment(),
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', totp_enabled: true, two_factor_enabled: true }) }),
      ]),
    });
    await renderWithClerk(<UserProfileMfaSection />);
    let requests = 0;
    worker.use(
      http.post(fapiUrl('/v1/me/backup_codes/'), () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json(
              { errors: [{ code: 'service_unavailable', message: 'Please try again.' }] },
              { status: 503 },
            )
          : undefined;
      }),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Backup codes/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please try again.'));
    expect(screen.queryByRole('button', { name: 'Copy and close' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Download' })).toBeNull();
    const retry = screen.getByRole('button', { name: 'Try again' });
    await waitFor(() => expect(retry).toHaveFocus());
    await user.click(retry);
    expect(await screen.findByText('CODE0100')).toBeVisible();
  });

  it('keeps issued codes available after copy fails and lets the user retry', async () => {
    await renderMfa();
    const write = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard unavailable'))
      .mockResolvedValue();
    try {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Add verification method' }));
      await user.click(screen.getByRole('button', { name: /Authenticator app/ }));
      await user.type(await screen.findByRole('textbox', { name: 'Verification code' }), '123456');
      const codes = await screen.findByRole('list', { name: 'Backup codes' });
      expect(within(codes).getByText('CODE0001')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Copy and close' }));
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Clipboard unavailable'));
      expect(within(codes).getByText('CODE0001')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Copy and close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(write).toHaveBeenCalledTimes(2);
    } finally {
      write.mockRestore();
    }
  });
});
