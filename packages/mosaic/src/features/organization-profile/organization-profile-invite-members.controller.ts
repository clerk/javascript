import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../components/form';
import { useToastManager } from '../../components/toast';
import { useMessages } from '../../localization';
import type { InviteMembersInput } from './invitations-table-tab.model';
import type { MembersRoles } from './members-table-tab.types';
import type { OrganizationProfileInviteMembersDialogProps } from './organization-profile-invite-members.dialog';

interface InviteMembersValues {
  emailAddresses: string[];
  role: string | null;
}

export interface InviteMembersControllerOptions {
  roles: MembersRoles | null;
  defaultRole: string | null;
  invite: ((input: InviteMembersInput) => Promise<void>) | undefined;
}

export function useInviteMembersController({ roles, defaultRole, invite }: InviteMembersControllerOptions) {
  const m = useMessages('organizationProfileInviteMembers');
  const roleNames = useMessages('roles');
  const toast = useToastManager();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const initialRole = roles ? resolveDefaultRole(roles, defaultRole) : null;

  const form = useForm<InviteMembersValues>({
    initialValues: { emailAddresses: [], role: initialRole },
    errorFallback: m.error,
    onSubmit: async ({ emailAddresses, role }) => {
      if (!invite || !roles || role === null) {
        return;
      }
      await invite({ emailAddresses, role, roles, onRejected: setRejectedEmailAddresses });
      setOpen(false);
      toast.add({ type: 'success', label: m.sent });
    },
  });

  if (!invite || !roles) {
    return { onInvite: undefined, inviteDialog: undefined };
  }

  const onOpenChange = (next: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset({ emailAddresses: [], role: initialRole });
    setRejectedEmailAddresses([]);
    setOpen(next);
  };

  const inviteDialog: OrganizationProfileInviteMembersDialogProps = {
    open,
    onOpenChange,
    finalFocus: trigger,
    emailAddresses: form.values.emailAddresses,
    onEmailAddressesChange: emailAddresses => form.setValue('emailAddresses', emailAddresses),
    rejectedEmailAddresses,
    roles: roles.roles.map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })),
    role: form.values.role,
    onRoleChange: role => form.setValue('role', role),
    isRoleDisabled: roles.hasRoleSetMigration,
    isPending: form.isSubmitting,
    error: form.error ?? null,
    onSubmit: form.submit,
  };

  const onInvite = (event: MouseEvent<HTMLButtonElement>) => {
    trigger.current = event.currentTarget;
    onOpenChange(true);
  };

  return { onInvite, inviteDialog };
}

function resolveDefaultRole({ roles }: MembersRoles, defaultRole: string | null) {
  const candidate = defaultRole ?? (roles.length === 1 ? roles[0]?.key : undefined);
  return roles.some(role => role.key === candidate) ? (candidate ?? null) : null;
}
