import { useToastManager } from '@clerk/mosaic/components/toast';
import type { OrganizationProfileInviteMembersDialogProps } from '@clerk/mosaic/features/organization-profile/organization-profile-invite-members.dialog';
import { useMessages } from '@clerk/mosaic/localization';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

const roles = [
  { value: 'member', label: 'Member', description: 'Role with non-privileged permissions in the organization.' },
  { value: 'admin', label: 'Admin', description: 'Role with elevated permissions in the organization.' },
];

const existingMembers = ['ada.lovelace@example.com', 'grace.hopper@example.com'];

export function useInviteMembersFixture(): {
  onInvite: (event: MouseEvent<HTMLButtonElement>) => void;
  inviteDialog: OrganizationProfileInviteMembersDialogProps;
} {
  const m = useMessages('organizationProfileInviteMembers');
  const toast = useToastManager();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>('member');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    onInvite: event => {
      trigger.current = event.currentTarget;
      setEmailAddresses([]);
      setRejectedEmailAddresses([]);
      setRole('member');
      setError(null);
      setOpen(true);
    },
    inviteDialog: {
      open,
      onOpenChange: setOpen,
      finalFocus: trigger,
      emailAddresses,
      onEmailAddressesChange: setEmailAddresses,
      rejectedEmailAddresses,
      roles,
      role,
      onRoleChange: setRole,
      isPending,
      error,
      onSubmit: async () => {
        setIsPending(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsPending(false);
        const rejected = emailAddresses.filter(email => existingMembers.includes(email));
        if (rejected.length > 0) {
          setRejectedEmailAddresses(rejected);
          setError(`${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} already a member.`);
          return;
        }
        setOpen(false);
        toast.add({ type: 'success', label: m.sent });
      },
    },
  };
}
