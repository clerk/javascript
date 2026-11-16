import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../../components/form';
import type { SelectItem } from '../../../components/select';
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

const EMPTY_INVITE: InviteMembersValues = { emailAddresses: [], emailDraft: '', role: null };

export interface InviteMembersForm {
  formId: string;
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  emailDraft: string;
  onEmailDraftChange: (emailDraft: string) => void;
  rejectedEmailAddresses: string[];
  roles: SelectItem[];
  role: string | null;
  onRoleChange: (role: string | null) => void;
  isRoleDisabled: boolean;
  canSubmit: boolean;
  isPending: boolean;
  error: string | undefined;
  onSubmit: (event: { preventDefault: () => void }) => void;
}

export interface InviteMembersFormOptions {
  roles: MembersRoles | null;
  defaultRole: string | null;
  errorFallback: string;
  send: ((input: InviteMembersInput) => Promise<void>) | undefined;
  onSent: (emailAddresses: string[]) => void;
}

export function useInviteMembersForm({ roles, defaultRole, errorFallback, send, onSent }: InviteMembersFormOptions) {
  const roleNames = useMessages('roles');
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const initialRole = roles ? resolveDefaultRole(roles, defaultRole) : null;

  const form = useForm<InviteMembersValues, string[] | null>({
    initialValues: EMPTY_INVITE,
    errorFallback,
    canSubmit: values => canSendInvitations({ ...values, role: values.role ?? initialRole, rejectedEmailAddresses }),
    onSubmit: async ({ role, ...draft }) => {
      const selected = role ?? initialRole;
      if (!send || !roles || selected === null) {
        return null;
      }
      const emailAddresses = emailAddressesToInvite(draft);
      await send({ emailAddresses, role: selected, roles, onRejected: setRejectedEmailAddresses });
      return emailAddresses;
    },
    onSuccess: invited => {
      if (invited) {
        onSent(invited);
      }
    },
  });

  const invite: InviteMembersForm = {
    formId: form.id,
    emailAddresses: form.values.emailAddresses,
    onEmailAddressesChange: emailAddresses => form.setValue('emailAddresses', emailAddresses),
    emailDraft: form.values.emailDraft,
    onEmailDraftChange: emailDraft => form.setValue('emailDraft', emailDraft),
    rejectedEmailAddresses,
    roles: (roles?.roles ?? []).map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })),
    role: form.values.role ?? initialRole,
    onRoleChange: role => form.setValue('role', role),
    isRoleDisabled: !roles || roles.hasRoleSetMigration,
    canSubmit: form.canSubmit || form.isSubmitting,
    isPending: form.isSubmitting,
    error: form.error,
    onSubmit: form.handleSubmit,
  };

  return {
    invite,
    get isSubmitting() {
      return form.isSubmitting;
    },
    reset: () => {
      form.reset();
      setRejectedEmailAddresses([]);
    },
  };
}

export interface InviteMembersControllerOptions {
  roles: MembersRoles | null;
  defaultRole: string | null;
  invite: ((input: InviteMembersInput) => Promise<void>) | undefined;
}

export function useInviteMembersController({ roles, defaultRole, invite }: InviteMembersControllerOptions) {
  const m = useMessages('organizationProfile').members.invite;
  const locale = useLocale();
  const toast = useToastManager();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const inviteForm = useInviteMembersForm({
    roles,
    defaultRole,
    errorFallback: m.error,
    send: invite,
    onSent: invited => {
      setOpen(false);
      toast.add({ type: 'success', label: plural(m.sent, invited.length, locale) });
    },
  });

  if (!invite) {
    return { onInvite: undefined, isInviteDisabled: false, inviteDialog: undefined };
  }

  const onOpenChange = (next: boolean) => {
    if (inviteForm.isSubmitting) {
      return;
    }
    inviteForm.reset();
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
    invite: inviteForm.invite,
  };

  return { onInvite, isInviteDisabled: false, inviteDialog };
}

export function resolveDefaultRole({ roles }: MembersRoles, defaultRole: string | null) {
  const candidate = defaultRole ?? (roles.length === 1 ? roles[0]?.key : undefined);
  return roles.some(role => role.key === candidate) ? (candidate ?? null) : null;
}
