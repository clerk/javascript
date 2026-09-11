import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileVerifyEmailSsoViewProps } from '../user-profile-verify-email-sso.view';
import { UserProfileVerifyEmailSsoView } from '../user-profile-verify-email-sso.view';

function renderView(overrides: Partial<UserProfileVerifyEmailSsoViewProps> = {}) {
  const props: UserProfileVerifyEmailSsoViewProps = {
    open: true,
    onOpenChange: vi.fn(),
    emailAddress: 'example@email.com',
    connection: { provider: 'Okta SSO', domain: 'acme.co' },
    onConnect: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileVerifyEmailSsoView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('UserProfileVerifyEmailSsoView', () => {
  it('shows the matching connection and lets the user connect to verify their email', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    expect(screen.getByRole('dialog', { name: 'Verify email address' })).toHaveAccessibleDescription(
      'Connect below to verify example@email.com',
    );
    expect(screen.getByText('Okta SSO')).toBeInTheDocument();
    expect(screen.getByText('acme.co · Enterprise SSO')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Connect' }));
    expect(props.onConnect).toHaveBeenCalledOnce();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('prevents another connection attempt while connecting and still allows cancellation', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ isConnecting: true });
    const connect = screen.getByRole('button', { name: 'Connect' });

    expect(connect).toBeDisabled();
    expect(connect).toHaveAttribute('aria-busy', 'true');
    await user.click(connect);
    expect(props.onConnect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('announces a supplied connection error and allows retry', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ errorMessage: 'Unable to connect to Okta. Try again.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to connect to Okta. Try again.');
    await user.click(screen.getByRole('button', { name: 'Connect' }));
    expect(props.onConnect).toHaveBeenCalledOnce();
  });
});
