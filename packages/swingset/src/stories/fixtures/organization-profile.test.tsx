import '@testing-library/jest-dom/vitest';

import { OrganizationProfileMembersPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel.view';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useOrganizationMembersFixture } from './organization-profile';

function EmptyInvitationsExample() {
  const props = useOrganizationMembersFixture({ invitations: [] });
  return (
    <MosaicProvider>
      <OrganizationProfileMembersPanelView
        {...props}
        defaultTab='invitations'
      />
    </MosaicProvider>
  );
}

describe('organization profile fixture', () => {
  it('adds a pending invitation from the invitations empty state', async () => {
    const user = userEvent.setup();
    render(<EmptyInvitationsExample />);
    expect(screen.getByText('No pending invitations')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Invite member' }));
    expect(await screen.findByText('new.member@clerk.dev')).toBeInTheDocument();
    expect(screen.queryByText('No pending invitations')).not.toBeInTheDocument();
  });
});
