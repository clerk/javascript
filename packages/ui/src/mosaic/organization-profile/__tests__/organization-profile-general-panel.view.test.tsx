import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

describe('OrganizationProfileGeneralPanelView', () => {
  it('renders organization details and danger actions', async () => {
    const onCopySlug = vi.fn();
    const onDeleteOrganization = vi.fn();
    const onLeaveOrganization = vi.fn();
    const onNameChange = vi.fn();
    const onUploadLogo = vi.fn();
    const user = userEvent.setup();

    render(
      <OrganizationProfileGeneralPanelView
        name='Clerk'
        slug='clerkorganization-177654156132154'
        onCopySlug={onCopySlug}
        onDeleteOrganization={onDeleteOrganization}
        onLeaveOrganization={onLeaveOrganization}
        onNameChange={onNameChange}
        onUploadLogo={onUploadLogo}
      />,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
    expect(screen.getByText('Organization details')).toBeInTheDocument();
    expect(screen.getByText('Danger zone')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Upload' }));
    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(screen.getByRole('button', { name: 'Leave organization' }));
    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    expect(onUploadLogo).toHaveBeenCalledOnce();
    expect(onNameChange).toHaveBeenCalledWith('Clerk');
    expect(onCopySlug).toHaveBeenCalledWith('clerkorganization-177654156132154');
    expect(onLeaveOrganization).toHaveBeenCalledOnce();
    expect(onDeleteOrganization).toHaveBeenCalledOnce();
  });

  it('omits unavailable actions and the empty danger section', () => {
    render(
      <OrganizationProfileGeneralPanelView
        name='Clerk'
        slug='clerk'
      />,
    );

    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
