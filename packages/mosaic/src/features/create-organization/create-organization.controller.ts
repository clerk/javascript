import { useState } from 'react';

import type { UseFormResult } from '../../components/form';
import { useForm } from '../../components/form';
import type { SelectItem } from '../../components/select';
import { useMessages } from '../../localization';
import type { MembersRoles } from '../organization-profile/organization-profile-members-panel/members-table-tab.types';
import { resolveDefaultRole } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import type { CreateOrganizationModel } from './create-organization.model';
import type { CreateOrganizationStep, CreateOrganizationValues } from './create-organization.types';
import { isSlug, toSlug } from './create-organization.utils';

export type CreateOrganizationReadyModel = Extract<CreateOrganizationModel, { status: 'ready' }>;

const initialValues: CreateOrganizationValues = { name: '', slug: '', logo: null };

export interface CreateOrganizationController {
  step: CreateOrganizationStep;
  form: UseFormResult<CreateOrganizationValues>;
  onNameChange: (name: string) => void;
  onFinish: () => void;
  onInvitationsSent: () => void;
}

export function useCreateOrganizationController(model: CreateOrganizationReadyModel): CreateOrganizationController {
  const m = useMessages('createOrganization');
  const [step, setStep] = useState<CreateOrganizationStep>({ step: 'create' });

  const finish = (organizationId: string) => {
    model.onComplete(organizationId);
    form.reset(initialValues);
    setStep({ step: 'create' });
  };

  const form = useForm<CreateOrganizationValues>({
    initialValues,
    fields: {
      slug: {
        validate: slug =>
          model.slugEnabled && slug !== '' && !isSlug(slug)
            ? { type: 'error', message: m.create.slugInvalid }
            : undefined,
      },
    },
    canSubmit: values => values.name.trim() !== '' && (!model.slugEnabled || values.slug !== ''),
    errorFallback: m.create.error,
    onSubmit: async values => {
      const created = await model.onCreate(values);
      if (created.skipInvitations) {
        finish(created.organizationId);
        return;
      }
      setStep({ step: 'invite', organizationId: created.organizationId });
    },
  });

  return {
    step,
    form,
    onNameChange: name => {
      form.setValue('name', name);
      if (model.slugEnabled) {
        form.setValue('slug', toSlug(name));
      }
    },
    onFinish: () => {
      if (step.step !== 'create') {
        finish(step.organizationId);
      }
    },
    onInvitationsSent: () => {
      if (step.step === 'invite') {
        setStep({ step: 'sent', organizationId: step.organizationId });
      }
    },
  };
}

interface InviteValues {
  emailAddresses: string[];
  role: string | null;
}

export interface CreateOrganizationInviteControllerOptions {
  organizationId: string | null;
  roles: MembersRoles | null;
  defaultRole: string | null;
  onInvite: CreateOrganizationReadyModel['onInvite'];
  onSent: () => void;
}

export interface CreateOrganizationInviteController {
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  rejectedEmailAddresses: string[];
  roles: SelectItem[];
  role: string | null;
  onRoleChange: (role: string | null) => void;
  isRoleDisabled: boolean;
  isPending: boolean;
  error: string | undefined;
  onSubmit: () => void;
}

export function useCreateOrganizationInviteController({
  organizationId,
  roles,
  defaultRole,
  onInvite,
  onSent,
}: CreateOrganizationInviteControllerOptions): CreateOrganizationInviteController {
  const m = useMessages('createOrganization');
  const roleNames = useMessages('roles');
  const [rejectedEmailAddresses, setRejectedEmailAddresses] = useState<string[]>([]);
  const initialRole = roles ? resolveDefaultRole(roles, defaultRole) : null;

  const form = useForm<InviteValues>({
    initialValues: { emailAddresses: [], role: null },
    errorFallback: m.invite.error,
    onSubmit: async ({ emailAddresses, role }) => {
      const selected = role ?? initialRole;
      if (!organizationId || selected === null) {
        return;
      }
      await onInvite(organizationId, { emailAddresses, role: selected, onRejected: setRejectedEmailAddresses });
      onSent();
    },
  });

  return {
    emailAddresses: form.values.emailAddresses,
    onEmailAddressesChange: emailAddresses => form.setValue('emailAddresses', emailAddresses),
    rejectedEmailAddresses,
    roles: (roles?.roles ?? []).map(role => ({ value: role.key, label: roleNames[role.key] ?? role.name })),
    role: form.values.role ?? initialRole,
    onRoleChange: role => form.setValue('role', role),
    isRoleDisabled: !roles || roles.hasRoleSetMigration,
    isPending: form.isSubmitting,
    error: form.error,
    onSubmit: form.submit,
  };
}
