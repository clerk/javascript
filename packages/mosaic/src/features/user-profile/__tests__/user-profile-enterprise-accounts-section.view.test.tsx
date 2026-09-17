import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileEnterpriseAccountsSectionView } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.view';

describe('UserProfileEnterpriseAccountsSectionView', () => {
  it.each([{ connections: [] }, { connections: [{ id: 'okta', name: 'Acme Okta' }] }])(
    'renders nothing without accounts or actionable connections (%j)',
    ({ connections }) => {
      const { container } = render(
        <UserProfileEnterpriseAccountsSectionView
          accounts={[]}
          connections={connections}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('offers a keyboard-accessible Connect button for each available connection', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(
      <UserProfileEnterpriseAccountsSectionView
        accounts={[]}
        connections={[{ id: 'sso', name: 'SSO', iconUrl: '   ' }]}
        onConnect={onConnect}
      />,
    );
    const button = screen.getByRole('button', { name: 'Connect SSO' });
    expect(screen.getByText('SSO')).toBeVisible();
    expect(screen.getByText('S', { exact: true })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    button.focus();
    await user.keyboard('{Enter}');
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('sso');
  });

  it('blocks connection actions while pending and enables retry with a row error', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const connections = [
      { id: 'okta', name: 'Acme Okta' },
      { id: 'saml', name: 'Custom SAML' },
    ];
    const { rerender } = render(
      <UserProfileEnterpriseAccountsSectionView
        accounts={[]}
        connections={connections}
        onConnect={onConnect}
        pendingConnectionId='okta'
      />,
    );
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Connect Custom SAML' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Connect Custom SAML' }));
    expect(onConnect).not.toHaveBeenCalled();
    rerender(
      <UserProfileEnterpriseAccountsSectionView
        accounts={[]}
        connections={[{ ...connections[0], connectError: 'Unable to connect' }, connections[1]]}
        onConnect={onConnect}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to connect');
    expect(screen.getByRole('button', { name: 'Connect Acme Okta' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Connect Custom SAML' })).toBeEnabled();
  });

  it('renders linked account identity and requires-action status from plain props', () => {
    render(
      <UserProfileEnterpriseAccountsSectionView
        accounts={[
          { id: 'okta', name: 'Acme Okta', emailAddress: 'test@acme.com', requiresAction: true },
          { id: 'custom', name: 'Custom SSO', iconUrl: 'https://example.com/logo.svg' },
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: 'Enterprise accounts' })).toBeInTheDocument();
    expect(screen.getByText('Acme Okta')).toBeInTheDocument();
    expect(screen.getByText('test@acme.com')).toBeInTheDocument();
    expect(screen.getByText('Requires action')).toBeInTheDocument();
    expect(screen.getByText('A', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Custom SSO')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
