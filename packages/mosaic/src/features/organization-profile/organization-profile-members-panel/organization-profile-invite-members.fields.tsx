import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Field } from '../../../components/field';
import type { SelectItem } from '../../../components/select';
import { Select } from '../../../components/select';
import { TagInput } from '../../../components/tag-input';
import { fill, useMessages } from '../../../localization';
import { styles } from './organization-profile-invite-members.styles';

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

interface InviteMembersValidity {
  emailAddresses: string[];
  rejectedEmailAddresses?: string[];
  role: string | null;
}

function isValidEmail(value: string, rejectedEmailAddresses: string[]) {
  return isEmail(value) && !rejectedEmailAddresses.includes(value);
}

export function hasInvalidEmailAddresses({
  emailAddresses,
  rejectedEmailAddresses = [],
}: Omit<InviteMembersValidity, 'role'>) {
  return !emailAddresses.every(value => isValidEmail(value, rejectedEmailAddresses));
}

export function canSendInvitations({ emailAddresses, rejectedEmailAddresses = [], role }: InviteMembersValidity) {
  return (
    emailAddresses.length > 0 && !hasInvalidEmailAddresses({ emailAddresses, rejectedEmailAddresses }) && role !== null
  );
}

export interface InviteMembersFieldsProps {
  emailInputRef?: Ref<HTMLInputElement>;
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  rejectedEmailAddresses?: string[];
  roles: SelectItem[];
  role: string | null;
  onRoleChange: (role: string | null) => void;
  isRoleDisabled?: boolean;
  isPending: boolean;
}

export function InviteMembersFields({
  emailInputRef,
  emailAddresses,
  onEmailAddressesChange,
  rejectedEmailAddresses = [],
  roles,
  role,
  onRoleChange,
  isRoleDisabled = false,
  isPending,
}: InviteMembersFieldsProps) {
  const m = useMessages('organizationProfileInviteMembers');
  const hasInvalid = hasInvalidEmailAddresses({ emailAddresses, rejectedEmailAddresses });

  return (
    <>
      <Field.Root
        required
        invalid={hasInvalid}
        disabled={isPending}
      >
        <div {...stylex.props(styles.labelRow)}>
          <Field.Label>{m.emailLabel}</Field.Label>
          <Field.Description>{m.emailHint}</Field.Description>
        </div>
        <TagInput
          ref={emailInputRef}
          name='emailAddresses'
          delimiters={[',', ' ']}
          value={emailAddresses}
          onValueChange={onEmailAddressesChange}
          validate={value => isValidEmail(value, rejectedEmailAddresses)}
          removeLabel={email => fill(m.removeEmail, { email })}
        />
        <Field.Message>
          <Field.Error>{hasInvalid ? m.invalidEmails : undefined}</Field.Error>
        </Field.Message>
      </Field.Root>
      <Field.Root
        required
        disabled={isPending || isRoleDisabled}
      >
        <Field.Label>{m.roleLabel}</Field.Label>
        <Select.Root
          items={roles}
          value={role ?? undefined}
          onValueChange={onRoleChange}
        >
          <Select.Trigger placeholder={m.rolePlaceholder} />
          <Select.Popup />
        </Select.Root>
      </Field.Root>
    </>
  );
}
