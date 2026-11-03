import { useToastManager } from '@clerk/mosaic/components/toast';
import type { OrganizationProfileInviteMembersDialogProps } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/organization-profile-invite-members.dialog';
import {
  canSendInvitations,
  pendingEmailAddresses,
} from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/organization-profile-invite-members.utils';
import { plural, useLocale, useMessages } from '@clerk/mosaic/localization';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosRole } from '@/lib/chaos';

const exampleRoles = [
  { value: 'member', label: 'Member', description: 'Role with non-privileged permissions in the organization.' },
  { value: 'admin', label: 'Admin', description: 'Role with elevated permissions in the organization.' },
];

const existingMembers = ['ada.lovelace@example.com', 'grace.hopper@example.com'];

export function useInviteMembersFixture(): {
  onInvite: (event: MouseEvent<HTMLButtonElement>) => void;
  inviteDialog: OrganizationProfileInviteMembersDialogProps;
} {
  const m = useMessages('organizationProfile').members.invite;
  const locale = useLocale();
  const roles = useChaosFixture(exampleRoles, items => items.map((role, index) => ({ ...role, ...chaosRole(index) })));
  const toast = useToastManager();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState('');
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>('member');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    onInvite: event => {
      trigger.current = event.currentTarget;
      setEmailAddresses([]);
      setEmailDraft('');
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
      emailDraft,
      onEmailDraftChange: setEmailDraft,
      rejectedEmailAddresses,
      roles,
      role,
      onRoleChange: setRole,
      canSubmit: canSendInvitations({ emailAddresses, emailDraft, rejectedEmailAddresses, role }),
      isPending,
      error,
      onSubmit: async () => {
        setIsPending(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsPending(false);
        const invited = pendingEmailAddresses({ emailAddresses, emailDraft });
        const rejected = invited.filter(email => existingMembers.includes(email));
        if (rejected.length > 0) {
          setRejectedEmailAddresses(rejected);
          setError(`${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} already a member.`);
          return;
        }
        setOpen(false);
        toast.add({ type: 'success', label: plural(m.sent, invited.length, locale) });
      },
    },
  };
}
