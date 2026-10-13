import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../../__tests__/clerk-errors';
import { MosaicProvider } from '../../../../mosaic-provider';
import { SaveError } from '../../../../utils/errors';
import { useUserProfileEmailSectionController } from '../user-profile-email-section.controller';
import type { ReadyEmailSectionModel } from '../user-profile-email-section.types';
import { UserProfileEmailSectionView } from '../user-profile-email-section.view';

const codeVerifier = {
  start: () => ({ method: 'code', sent: Promise.resolve() }) as const,
  verifyCode: () => Promise.resolve(),
};

type EmailSectionProps = Partial<Omit<ReadyEmailSectionModel, 'status' | 'userId'>>;

function EmailSection({
  emails = [{ id: 'email_1', value: 'test@example.com', isDefault: false, isVerified: true }],
  getEmailVerifier = () => codeVerifier,
  onSetPrimaryEmail = () => Promise.resolve(),
  ...rest
}: EmailSectionProps) {
  const controller = useUserProfileEmailSectionController({ emails, getEmailVerifier, onSetPrimaryEmail, ...rest });
  return <UserProfileEmailSectionView {...controller} />;
}

function renderEmail(overrides: EmailSectionProps = {}) {
  return render(
    <MosaicProvider>
      <EmailSection
        username='test'
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('email actions', () => {
  it('keeps the email when removal is canceled with Escape', async () => {
    const user = userEvent.setup();
    const onRemoveEmail = vi.fn();
    renderEmail({
      emails: [{ id: 'email_1', value: 'test@example.com', isDefault: true, isVerified: true }],
      onRemoveEmail,
    });
    const trigger = screen.getByRole('button', { name: 'Manage test@example.com' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alertdialog', { name: 'Remove email address?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemoveEmail).not.toHaveBeenCalled();
  });

  it('shows Add email after removing the last email', async () => {
    const user = userEvent.setup();
    function Example() {
      const [emails, setEmails] = useState([
        { id: 'email_1', value: 'test@example.com', isDefault: false, isVerified: true },
      ]);
      return (
        <MosaicProvider>
          <EmailSection
            username='test'
            emails={emails}
            onCreateEmail={() => Promise.resolve(codeVerifier)}
            onRemoveEmail={id => {
              setEmails(current => current.filter(email => email.id !== id));
              return Promise.resolve();
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Manage test@example.com' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add email' })).toBeEnabled();
  });

  it('shows why the primary update failed, without opening a dialog', async () => {
    const user = userEvent.setup();
    const onSetPrimaryEmail = vi.fn().mockRejectedValue(new SaveError({ global: { message: 'Not verified yet.' } }));
    renderEmail({ onSetPrimaryEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryEmail).toHaveBeenCalledExactlyOnceWith('email_1');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Not verified yet.'));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the generic message and logs a primary update that threw unexpectedly', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const failure = new TypeError('boom');
    const onSetPrimaryEmail = vi.fn().mockRejectedValue(failure);
    renderEmail({ onSetPrimaryEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', failure);
    log.mockRestore();
  });

  it('keeps removal pending and lets the user retry a failure in the dialog', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemoveEmail = vi.fn().mockReturnValueOnce(removal.promise).mockResolvedValue(undefined);
    renderEmail({ onRemoveEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove email address?' });
    expect(dialog).toHaveAccessibleDescription(/test@example.com/);
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(within(dialog).getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      removal.reject(clerkApiError('email_address_in_use', 'Unable to remove email.'));
      await removal.promise.catch(() => undefined);
    });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to remove email.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemoveEmail).toHaveBeenNthCalledWith(1, 'email_1');
    expect(onRemoveEmail).toHaveBeenNthCalledWith(2, 'email_1');
  });
  it.each([
    [true, 'You won’t be able to use it to sign in.'],
    [false, undefined],
  ])('warns about signing in only when removing a verified email (verified: %s)', async (isVerified, warning) => {
    const user = userEvent.setup();
    renderEmail({
      emails: [{ id: 'email_1', value: 'test@example.com', isDefault: false, isVerified }],
      onRemoveEmail: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    const dialog = screen.getByRole('alertdialog');
    if (warning) {
      expect(dialog).toHaveTextContent(warning);
    } else {
      expect(dialog).not.toHaveTextContent('sign in');
    }
  });

  it('renders the emails as a group with an Add action', () => {
    renderEmail({
      emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true }],
      onCreateEmail: () => Promise.resolve(codeVerifier),
    });

    const group = screen.getByRole('group', { name: 'Email' });
    expect(within(group).getByRole('heading', { name: 'Email' })).toHaveClass('cl-section-title');
    expect(within(group).getByRole('list')).toContainElement(screen.getByText('item1@clerk.dev'));
    expect(screen.getByText('item1@clerk.dev').closest('.cl-section-item')).toHaveTextContent('Primary');
    expect(within(group).getByRole('button', { name: 'Add email' })).toHaveTextContent('Add');
  });

  it('offers set primary and remove where each applies', async () => {
    const user = userEvent.setup();
    const onSetPrimaryEmail = vi.fn().mockResolvedValue(undefined);
    const onRemoveEmail = vi.fn().mockResolvedValue(undefined);
    renderEmail({
      emails: [
        { id: 'email_primary', value: 'primary@clerk.dev', isDefault: true, isVerified: true },
        { id: 'email_secondary', value: 'secondary@clerk.dev', isDefault: false, isVerified: true },
      ],
      onSetPrimaryEmail,
      onRemoveEmail,
    });

    await user.click(screen.getByRole('button', { name: 'Manage secondary@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryEmail).toHaveBeenCalledWith('email_secondary');

    await user.click(screen.getByRole('button', { name: 'Manage secondary@clerk.dev' }));
    const removeEmail = screen.getByRole('menuitem', { name: 'Remove email' });
    expect(removeEmail).toHaveAttribute('data-color', 'negative');
    await user.click(removeEmail);
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Remove email address?' })).getByRole('button', {
        name: 'Remove',
      }),
    );
    expect(onRemoveEmail).toHaveBeenCalledWith('email_secondary');
  });

  it.each([
    ['email_primary', 'primary@clerk.dev', true, 'Complete verification'],
    ['email_unverified', 'unverified@clerk.dev', false, 'Verify'],
  ])('opens verification for %s', async (id, value, isDefault, action) => {
    const user = userEvent.setup();
    const getEmailVerifier = vi.fn(() => codeVerifier);
    renderEmail({ emails: [{ id, value, isDefault, isVerified: false }], getEmailVerifier });

    await user.click(screen.getByRole('button', { name: `Manage ${value}` }));
    await user.click(screen.getByRole('menuitem', { name: action }));

    expect(getEmailVerifier).toHaveBeenCalledExactlyOnceWith(id);
    expect(await screen.findByRole('dialog', { name: 'Verify your email' })).toBeInTheDocument();
  });
});
