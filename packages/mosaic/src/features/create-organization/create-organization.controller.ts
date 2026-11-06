import { useState } from 'react';

import type { UseFormResult } from '../../components/form';
import { useForm } from '../../components/form';
import { useMessages } from '../../localization';
import type { MembersRoles } from '../organization-profile/organization-profile-members-panel/members-table-tab.types';
import type { InviteMembersForm } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import { useInviteMembersForm } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import type { CreateOrganizationModel } from './create-organization.model';
import type {
  CreatedOrganization,
  CreateOrganizationStep,
  CreateOrganizationValues,
} from './create-organization.types';
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

export function useCreateOrganizationController(
  model: CreateOrganizationReadyModel,
  { onRestart }: { onRestart?: () => void } = {},
): CreateOrganizationController {
  const m = useMessages('createOrganization');
  const [step, setStep] = useState<CreateOrganizationStep>({ step: 'create' });

  const finish = async (organizationId: string) => {
    await model.onComplete(organizationId);
    onRestart?.();
  };

  const form = useForm<CreateOrganizationValues, CreatedOrganization>({
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
    onSubmit: values => model.onCreate(values),
    onSuccess: created => {
      if (created.skipInvitations) {
        void finish(created.organizationId);
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
        void finish(step.organizationId);
      }
    },
    onInvitationsSent: () => {
      if (step.step === 'invite') {
        setStep({ step: 'sent', organizationId: step.organizationId });
      }
    },
  };
}

export interface CreateOrganizationInviteControllerOptions {
  organizationId: string | null;
  roles: MembersRoles | null;
  defaultRole: string | null;
  onInvite: CreateOrganizationReadyModel['onInvite'];
  onSent: () => void;
}

export function useCreateOrganizationInviteController({
  organizationId,
  roles,
  defaultRole,
  onInvite,
  onSent,
}: CreateOrganizationInviteControllerOptions): InviteMembersForm {
  const m = useMessages('createOrganization');
  return useInviteMembersForm({
    roles,
    defaultRole,
    errorFallback: m.invite.error,
    send: organizationId ? input => onInvite(organizationId, input) : undefined,
    onSent,
  }).invite;
}
