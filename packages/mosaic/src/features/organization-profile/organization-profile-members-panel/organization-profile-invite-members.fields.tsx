import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Field } from '../../../components/field';
import type { SelectItem } from '../../../components/select';
import { Select } from '../../../components/select';
import { TagInput } from '../../../components/tag-input';
import { fill, useMessages } from '../../../localization';
import { styles } from './organization-profile-invite-members.styles';
import { hasInvalidEmailAddresses, isValidEmail } from './organization-profile-invite-members.utils';

export interface InviteMembersFieldsProps {
  emailInputRef?: Ref<HTMLInputElement>;
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  onEmailDraftChange: (emailDraft: string) => void;
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
  onEmailDraftChange,
  rejectedEmailAddresses = [],
  roles,
  role,
  onRoleChange,
  isRoleDisabled = false,
  isPending,
}: InviteMembersFieldsProps) {
  const m = useMessages('organizationProfile').members.invite;
  const hasInvalid = hasInvalidEmailAddresses(emailAddresses, rejectedEmailAddresses);

  return (
    <>
      <Field.Root
        required
        invalid={hasInvalid}
        disabled={isPending}
        focusableWhenDisabled
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
          onInputValueChange={onEmailDraftChange}
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
