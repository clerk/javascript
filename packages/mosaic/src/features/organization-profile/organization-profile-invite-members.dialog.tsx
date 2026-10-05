import * as stylex from '@stylexjs/stylex';
import { useId, useRef } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import type { SelectItem } from '../../components/select';
import { Select } from '../../components/select';
import { TagInput } from '../../components/tag-input';
import { fill, useMessages } from '../../localization';
import { styles } from './organization-profile-invite-members.styles';

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export interface OrganizationProfileInviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  emailAddresses: string[];
  onEmailAddressesChange: (emailAddresses: string[]) => void;
  rejectedEmailAddresses?: string[];
  roles: SelectItem[];
  role: string | null;
  onRoleChange: (role: string | null) => void;
  isPending: boolean;
  error: string | null;
  onSubmit: () => void | Promise<void>;
}

export function OrganizationProfileInviteMembersDialog({
  open,
  onOpenChange,
  finalFocus,
  emailAddresses,
  onEmailAddressesChange,
  rejectedEmailAddresses = [],
  roles,
  role,
  onRoleChange,
  isPending,
  error,
  onSubmit,
}: OrganizationProfileInviteMembersDialogProps) {
  const m = useMessages('organizationProfileInviteMembers');
  const formId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const isValid = (value: string) => isEmail(value) && !rejectedEmailAddresses.includes(value);
  const hasInvalid = !emailAddresses.every(isValid);
  const canSubmit = emailAddresses.length > 0 && !hasInvalid && role !== null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      <Dialog.Popup
        compactPlacement='sheet'
        initialFocus={emailInput}
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          size='lg'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.title}</Card.Title>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {error}
          </Card.Banner>
          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={event => {
                  event.preventDefault();
                  if (canSubmit && !isPending) {
                    void onSubmit();
                  }
                }}
              />
            }
          >
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
                ref={emailInput}
                name='emailAddresses'
                value={emailAddresses}
                onValueChange={onEmailAddressesChange}
                validate={isValid}
                removeLabel={email => fill(m.removeEmail, { email })}
              />
              <Field.Message>
                <Field.Error>{hasInvalid ? m.invalidEmails : undefined}</Field.Error>
              </Field.Message>
            </Field.Root>
            <Field.Root
              required
              disabled={isPending}
            >
              <Field.Label>{m.roleLabel}</Field.Label>
              <Select.Root
                items={roles}
                value={role ?? undefined}
                onValueChange={value => onRoleChange(value ?? null)}
              >
                <Select.Trigger placeholder={m.rolePlaceholder} />
                <Select.Popup />
              </Select.Root>
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              disabled={isPending}
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                >
                  {m.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isPending}
              disabled={!canSubmit}
              focusableWhenDisabled
            >
              {m.submit}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
