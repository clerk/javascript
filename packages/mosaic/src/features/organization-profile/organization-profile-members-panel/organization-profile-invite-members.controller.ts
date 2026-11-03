import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../../components/form';
import { useToastManager } from '../../../components/toast';
import { plural, useLocale, useMessages } from '../../../localization';
import type { MembersRoles } from './members-table-tab.types';
import type { OrganizationProfileInviteMembersDialogProps } from './organization-profile-invite-members.dialog';
import type { InviteMembersInput } from './organization-profile-invite-members.model';
import { canSendInvitations, emailAddressesToInvite } from './organization-profile-invite-members.utils';

interface InviteMembersValues {
  emailAddresses: string[];
  emailDraft: string;
  role: string | null;
}

export interface InviteMembersControllerOptions {
  roles: MembersRoles | null;
  defaultRole: string | null;
  invite: ((input: InviteMembersInput) => Promise<void>) | undefined;
}

export function useInviteMembersController({ roles, defaultRole, invite }: InviteMembersControllerOptions) {
  const m = useMessages('organizationProfile').members.invite;
  const roleNames = useMessages('roles');
  const locale = useLocale();
  const toast = useToastManager();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const initialRole = roles ? resolveDefaultRole(roles, defaultRole) : null;

  const form = useForm<InviteMembersValues, string[] | null>({
    initialValues: { emailAddresses: [], emailDraft: '', role: initialRole },
    errorFallback: m.error,
    canSubmit: values => canSendInvitations({ ...values, rejectedEmailAddresses }),
    onSubmit: async ({ role, ...draft }) => {
      if (!invite || !roles || role === null) {
        return null;
      }
      const emailAddresses = emailAddressesToInvite(draft);
      await invite({ emailAddresses, role, roles, onRejected: setRejectedEmailAddresses });
      return emailAddresses;
    },
    onSuccess: invited => {
      if (!invited) {
        return;
      }
      setOpen(false);
      toast.add({ type: 'success', label: plural(m.sent, invited.length, locale) });
    },
  });

  if (!invite) {
    return { onInvite: undefined, isInviteDisabled: false, inviteDialog: undefined };
  }

  const onOpenChange = (next: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset({ emailAddresses: [], emailDraft: '', role: initialRole });
    setRejectedEmailAddresses([]);
    setOpen(next);
  };

  const onInvite = (event: MouseEvent<HTMLButtonElement>) => {
    trigger.current = event.currentTarget;
    onOpenChange(true);
  };

  if (!roles) {
    return { onInvite, isInviteDisabled: true, inviteDialog: undefined };
  }

  const inviteDialog: OrganizationProfileInviteMembersDialogProps = {
    open,
    onOpenChange,
    finalFocus: trigger,
    emailAddresses: form.values.emailAddresses,
    onEmailAddressesChange: emailAddresses => form.setValue('emailAddresses', emailAddresses),
    emailDraft: form.values.emailDraft,
    onEmailDraftChange: emailDraft => form.setValue('emailDraft', emailDraft),
    rejectedEmailAddresses,
    roles: roles.roles.map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })),
    role: form.values.role,
    onRoleChange: role => form.setValue('role', role),
    isRoleDisabled: roles.hasRoleSetMigration,
    canSubmit: form.canSubmit || form.isSubmitting,
    isPending: form.isSubmitting,
    error: form.error ?? null,
    onSubmit: form.submit,
  };

  return { onInvite, isInviteDisabled: false, inviteDialog };
}

export function resolveDefaultRole({ roles }: MembersRoles, defaultRole: string | null) {
  const candidate = defaultRole ?? (roles.length === 1 ? roles[0]?.key : undefined);
  return roles.some(role => role.key === candidate) ? (candidate ?? null) : null;
}
