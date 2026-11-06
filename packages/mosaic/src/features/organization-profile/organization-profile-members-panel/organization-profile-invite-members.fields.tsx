import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Field } from '../../../components/field';
import { Select } from '../../../components/select';
import { TagInput } from '../../../components/tag-input';
import { fill, useMessages } from '../../../localization';
import type { InviteMembersForm } from './organization-profile-invite-members.controller';
import { styles } from './organization-profile-invite-members.styles';
import { hasInvalidEmailAddresses, isValidEmail } from './organization-profile-invite-members.utils';

export interface InviteMembersFieldsProps {
  emailInputRef?: Ref<HTMLInputElement>;
  invite: InviteMembersForm;
}

export function InviteMembersFields({ emailInputRef, invite }: InviteMembersFieldsProps) {
  const m = useMessages('organizationProfile').members.invite;
  const {
    emailAddresses,
    onEmailAddressesChange,
    emailDraft,
    onEmailDraftChange,
    rejectedEmailAddresses,
    roles,
    role,
    onRoleChange,
    isRoleDisabled,
    isPending,
  } = invite;
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
          inputValue={emailDraft}
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
          value={role}
          onValueChange={onRoleChange}
        >
          <Select.Trigger placeholder={m.rolePlaceholder} />
          <Select.Popup />
        </Select.Root>
      </Field.Root>
    </>
  );
}
