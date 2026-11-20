import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { PathRouter } from '@/ui/router';

import { UserProfile } from '../';
import { VerificationSuccessPage } from '../VerifyWithLink';

const { createFixtures } = bindCreateFixtures('UserProfile');

const visit = (status?: string) => {
  window.history.replaceState({}, '', status ? `/user/verify?__clerk_status=${status}` : '/user/verify');
};

const renderWithStatus = async (status?: string) => {
  visit(status);
  const { wrapper } = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  render(
    <CardStateProvider>
      <VerificationSuccessPage />
    </CardStateProvider>,
    { wrapper },
  );
};

describe('VerificationSuccessPage', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('confirms the email address when the link verified it', async () => {
    await renderWithStatus('verified');

    screen.getByText('Successfully verified email');
  });

  it('confirms the email address when the link carries no status', async () => {
    await renderWithStatus();

    screen.getByText('Successfully verified email');
  });

  it('says the link has expired', async () => {
    await renderWithStatus('expired');

    screen.getByText('This verification link has expired');
  });

  it('says the link is invalid when verification failed', async () => {
    await renderWithStatus('failed');

    screen.getByText('This verification link is invalid');
  });

  it('asks to open the link where it was requested when opened in another browser', async () => {
    await renderWithStatus('client_mismatch');

    screen.getByText('Verification link is invalid for this device');
    screen.getByText('To verify this email address, open the link on the device and browser where you requested it');
  });

  it.each(['transferable', 'unknown'])('says the link is invalid for the status %s', async status => {
    await renderWithStatus(status);

    screen.getByText('This verification link is invalid');
    expect(screen.queryByText('Successfully verified email')).not.toBeInTheDocument();
  });

  it('shows the status of the link it navigates to in a mounted <UserProfile />', async () => {
    visit('verified');
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    render(
      <PathRouter basePath='/user'>
        <UserProfile />
      </PathRouter>,
      { wrapper },
    );
    await screen.findByText('Successfully verified email');

    act(() => window.history.pushState({}, '', '/user/verify?__clerk_status=expired'));

    await screen.findByText('This verification link has expired');
    expect(screen.queryByText('Successfully verified email')).not.toBeInTheDocument();
  });
});
