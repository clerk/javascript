import { ClerkAPIResponseError, ClerkWebAuthnError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { mockWebAuthn, render, waitFor } from '@/test/utils';

import { TaskSetupPasskey } from '..';

const { createFixtures } = bindCreateFixtures('TaskSetupPasskey');

const withPendingTask = createFixtures.config(f => {
  f.withUser({
    email_addresses: ['test@clerk.com'],
    identifier: 'test@clerk.com',
    tasks: [{ key: 'setup-passkey' }],
  });
});

// The task payload carries only its key, so the declinable/required split comes from the instance
// setting. The base fixture leaves `prompt_at_sign_up` unset, which is the optional-style default.
const withRequiredPasskey = createFixtures.config(f => {
  f.withPasskeySettings({ prompt_at_sign_up: 'required' });
});

describe('TaskSetupPasskey', () => {
  // jsdom exposes no `window.PublicKeyCredential`, so anything outside `mockWebAuthn`
  // is a device that cannot create a passkey.
  describe('unsupported devices', () => {
    // GIVEN a device without a platform authenticator
    // WHEN the task mounts
    // THEN it is declined on the user's behalf and the offer is never rendered
    it('skips the task without ever rendering the card', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);

      const { queryByText } = render(<TaskSetupPasskey />, { wrapper });

      await waitFor(() => expect(fixtures.clerk.session?.skipTask).toHaveBeenCalledWith('setup-passkey'));
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
      expect(queryByText('Set up a passkey')).not.toBeInTheDocument();
      expect(fixtures.clerk.user?.createPasskey).not.toHaveBeenCalled();
    });

    it('falls back to a decline-only card when the automatic skip fails', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);
      fixtures.clerk.session?.skipTask.mockRejectedValueOnce(
        new ClerkAPIResponseError('Request failed', {
          data: [{ code: 'internal_server_error', message: 'Something went wrong', long_message: undefined }],
          status: 500,
        }),
      );

      const { findByText, queryByRole } = render(<TaskSetupPasskey />, { wrapper });

      expect(await findByText('Set up a passkey')).toBeInTheDocument();
      expect(queryByRole('button', { name: /not now/i })).toBeInTheDocument();
      expect(queryByRole('button', { name: /create a passkey/i })).not.toBeInTheDocument();
    });
  });

  mockWebAuthn(() => {
    describe('task guard', () => {
      it('does not render component without existing session task', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withUser({ email_addresses: ['test@clerk.com'], identifier: 'test@clerk.com' });
        });

        const { queryByText } = render(<TaskSetupPasskey />, { wrapper });

        await waitFor(() => expect(queryByText('Set up a passkey')).not.toBeInTheDocument());
        expect(fixtures.clerk.session?.skipTask).not.toHaveBeenCalled();
      });
    });

    it('renders the offer with both a register and a decline action', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);

      const { findByText, getByRole, queryByText } = render(<TaskSetupPasskey />, { wrapper });

      expect(await findByText('Set up a passkey')).toBeInTheDocument();
      // An optional task is an offer, and the copy has to read like one.
      expect(queryByText(/next time, sign in/i)).toBeInTheDocument();
      expect(queryByText(/requires a passkey to finish signing up/i)).not.toBeInTheDocument();
      expect(getByRole('button', { name: /create a passkey/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /not now/i })).toBeInTheDocument();
      expect(getByRole('link', { name: /sign out/i })).toBeInTheDocument();
      expect(fixtures.clerk.session?.skipTask).not.toHaveBeenCalled();
    });

    it('registers a passkey and moves on to the next task', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);
      fixtures.clerk.user?.createPasskey.mockResolvedValue({} as any);

      const { findByRole, userEvent } = render(<TaskSetupPasskey />, { wrapper });

      await userEvent.click(await findByRole('button', { name: /create a passkey/i }));

      await waitFor(() => expect(fixtures.clerk.user?.createPasskey).toHaveBeenCalled());
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
      expect(fixtures.clerk.session?.skipTask).not.toHaveBeenCalled();
    });

    it('declines the task when the secondary action is used', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);

      const { findByRole, userEvent } = render(<TaskSetupPasskey />, { wrapper });

      await userEvent.click(await findByRole('button', { name: /not now/i }));

      await waitFor(() => expect(fixtures.clerk.session?.skipTask).toHaveBeenCalledWith('setup-passkey'));
      expect(fixtures.clerk.user?.createPasskey).not.toHaveBeenCalled();
    });

    // GIVEN the user dismisses the OS WebAuthn dialog
    // WHEN registration rejects
    // THEN the card stays put with both actions still available
    it('keeps the card usable when the WebAuthn dialog is cancelled', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask);
      fixtures.clerk.user?.createPasskey.mockRejectedValue(
        new ClerkWebAuthnError('Passkey registration was cancelled or timed out.', {
          code: 'passkey_registration_cancelled',
        }),
      );

      const { findByRole, findByText, getByRole, userEvent } = render(<TaskSetupPasskey />, { wrapper });

      await userEvent.click(await findByRole('button', { name: /create a passkey/i }));

      expect(await findByText(/cancelled or timed out/i)).toBeInTheDocument();
      expect(getByRole('button', { name: /create a passkey/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /not now/i })).toBeInTheDocument();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });

    // GIVEN an instance that requires a passkey
    // WHEN the card renders on a capable device
    // THEN there is no way to decline, and the copy states the requirement instead of offering a choice
    it('states the requirement and offers no decline affordance when the task is required', async () => {
      const { wrapper, fixtures } = await createFixtures(withPendingTask, withRequiredPasskey);

      const { findByRole, queryByRole, queryByText } = render(<TaskSetupPasskey />, { wrapper });

      expect(await findByRole('button', { name: /create a passkey/i })).toBeInTheDocument();
      expect(queryByRole('button', { name: /not now/i })).not.toBeInTheDocument();
      expect(queryByText(/requires a passkey to finish signing up/i)).toBeInTheDocument();
      expect(queryByText(/next time, sign in/i)).not.toBeInTheDocument();
      expect(fixtures.clerk.session?.skipTask).not.toHaveBeenCalled();
    });
  });

  // GIVEN an instance that requires a passkey and a device that cannot create one
  // WHEN the task renders
  // THEN the user gets a dead-end explanation, and the task is never auto-skipped
  it('explains the dead end for a required task on an unsupported device', async () => {
    const { wrapper, fixtures } = await createFixtures(withPendingTask, withRequiredPasskey);

    const { findByText, queryByRole } = render(<TaskSetupPasskey />, { wrapper });

    expect(await findByText("This device can't create a passkey")).toBeInTheDocument();
    expect(fixtures.clerk.session?.skipTask).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(queryByRole('button', { name: /create a passkey/i })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: /not now/i })).not.toBeInTheDocument();
    // Signing out is the only way forward, and it stays reachable.
    expect(queryByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });
});
