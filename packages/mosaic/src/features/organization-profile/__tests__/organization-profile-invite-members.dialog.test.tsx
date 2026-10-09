import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import type { OrganizationProfileInviteMembersDialogProps } from '../organization-profile-invite-members.dialog';
import { OrganizationProfileInviteMembersDialog } from '../organization-profile-invite-members.dialog';

type HarnessProps = Partial<Omit<OrganizationProfileInviteMembersDialogProps, 'emailAddresses'>> & {
  initialEmailAddresses?: string[];
};

function Harness({ initialEmailAddresses = [], ...overrides }: HarnessProps) {
  const [emailAddresses, setEmailAddresses] = useState(initialEmailAddresses);
  const [role, setRole] = useState<string | null>('member');
  return (
    <OrganizationProfileInviteMembersDialog
      open
      onOpenChange={vi.fn()}
      emailAddresses={emailAddresses}
      onEmailAddressesChange={setEmailAddresses}
      roles={[
        { value: 'member', label: 'Member', description: 'Non-privileged permissions.' },
        { value: 'admin', label: 'Admin', description: 'Elevated permissions.' },
      ]}
      role={role}
      onRoleChange={setRole}
      isPending={false}
      error={null}
      onSubmit={vi.fn()}
      {...overrides}
    />
  );
}

function renderDialog(props: HarnessProps = {}) {
  return render(
    <MosaicProvider>
      <Harness {...props} />
    </MosaicProvider>,
  );
}

describe('OrganizationProfileInviteMembersDialog', () => {
  it('blocks submitting until malformed emails are removed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderDialog({ onSubmit, initialEmailAddresses: ['preston@clerk.dev', 'nate'] });

    expect(screen.getByText('Remove invalid email addresses to continue')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send invites' }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remove nate' }));
    await user.click(screen.getByRole('button', { name: 'Send invites' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
