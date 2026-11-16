import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../../mosaic-provider';
import { useInviteMembersForm } from '../organization-profile-invite-members.controller';
import { OrganizationProfileInviteMembersDialog } from '../organization-profile-invite-members.dialog';
import type { InviteMembersInput } from '../organization-profile-invite-members.model';

function Harness({ send }: { send: (input: InviteMembersInput) => Promise<void> }) {
  const { invite } = useInviteMembersForm({
    roles: {
      roles: [
        { key: 'org:member', name: 'Member' },
        { key: 'org:admin', name: 'Admin' },
      ],
      hasRoleSetMigration: false,
    },
    defaultRole: 'org:member',
    errorFallback: 'Something went wrong.',
    send,
    onSent: vi.fn(),
  });
  return (
    <OrganizationProfileInviteMembersDialog
      open
      onOpenChange={vi.fn()}
      invite={invite}
    />
  );
}

describe('OrganizationProfileInviteMembersDialog', () => {
  it('blocks submitting until malformed emails are removed', async () => {
    const user = userEvent.setup();
    const send = vi.fn(() => Promise.resolve());
    render(
      <MosaicProvider>
        <Harness send={send} />
      </MosaicProvider>,
    );

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'preston@clerk.dev,nate,');
    expect(screen.getByText('Remove invalid email addresses to continue')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send invites' }));
    expect(send).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remove nate' }));
    await user.click(screen.getByRole('button', { name: 'Send invites' }));
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ emailAddresses: ['preston@clerk.dev'], role: 'org:member' }),
    );
  });
});
