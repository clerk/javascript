import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { OrganizationProfileSecurityPanelView } from '../organization-profile-security-panel.view';

function renderView(overrides: Partial<React.ComponentProps<typeof OrganizationProfileSecurityPanelView>> = {}) {
  const props = {
    sso: {
      connections: [{ id: 'sso', domain: 'clerk.dev', protocol: 'SAML' }],
      onAdd: vi.fn(),
      onManage: vi.fn(),
    },
    verifiedDomains: {
      domains: [{ id: 'domain', name: 'clerk.dev', enrollmentModeLabel: 'Automatic invitations' }],
      onAdd: vi.fn(),
      onManage: vi.fn(),
    },
    ...overrides,
  };

  return {
    ...render(
      <MosaicProvider>
        <OrganizationProfileSecurityPanelView {...props} />
      </MosaicProvider>,
    ),
    props,
  };
}

describe('OrganizationProfileSecurityPanelView', () => {
  it('composes authentication and access sections', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 3, name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Access' })).toBeInTheDocument();
    expect(screen.getByText('SSO')).toBeInTheDocument();
    expect(screen.getByText('Verified domains')).toBeInTheDocument();
    expect(screen.getByText('SAML')).toBeInTheDocument();
    expect(screen.getByText('Automatic invitations')).toBeInTheDocument();
  });

  it('forwards add and manage actions to each section', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    const addButtons = screen.getAllByRole('button', { name: 'Add' });
    await user.click(addButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Manage SSO for clerk.dev' }));
    await user.click(addButtons[1]);
    await user.click(screen.getByRole('button', { name: 'Manage clerk.dev' }));

    expect(props.sso.onAdd).toHaveBeenCalledOnce();
    expect(props.sso.onManage).toHaveBeenCalledWith('sso');
    expect(props.verifiedDomains.onAdd).toHaveBeenCalledOnce();
    expect(props.verifiedDomains.onManage).toHaveBeenCalledWith('domain');
  });

  it('keeps section headers when no connections or domains exist', () => {
    renderView({
      sso: { connections: [] },
      verifiedDomains: { domains: [] },
    });

    expect(screen.getByText('SSO')).toBeInTheDocument();
    expect(screen.getByText('Verified domains')).toBeInTheDocument();
    expect(screen.queryByText('SAML')).not.toBeInTheDocument();
  });
});
