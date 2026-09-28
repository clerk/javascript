import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
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
  it('turns typed emails into tags and submits them', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });

    const submit = screen.getByRole('button', { name: 'Send invites' });
    expect(submit).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'preston@clerk.dev,nate@clerk.dev{Enter}');
    expect(screen.getByRole('button', { name: 'Remove preston@clerk.dev' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove nate@clerk.dev' })).toBeInTheDocument();

    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

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

  it('marks emails the server rejected and shows its error', () => {
    renderDialog({
      initialEmailAddresses: ['preston@clerk.dev', 'ada@clerk.dev'],
      rejectedEmailAddresses: ['ada@clerk.dev'],
      error: 'ada@clerk.dev is already a member.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent('ada@clerk.dev is already a member.');
    expect(screen.getByRole('button', { name: 'Send invites' })).toHaveAttribute('aria-disabled', 'true');
  });
});
