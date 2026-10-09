import { useMergeRefs } from '@floating-ui/react';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Checkbox } from '../../../components/checkbox';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { useMessages } from '../../../localization';
import type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValues,
} from './user-profile-password-section.types';

export interface UserProfileEditPasswordDialogProps {
  passwordFeedback?: FieldFeedback;
  identifier?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  form: UseFormResult<UserProfileEditPasswordValues>;
}

export function UserProfileEditPasswordDialog({
  passwordFeedback,
  identifier = '',
  open,
  onOpenChange,
  trigger,
  hasPassword = false,
  requiresCurrentPassword = false,
  form,
}: UserProfileEditPasswordDialogProps) {
  const m = useMessages('userProfilePasswordSection');
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const showCurrentPassword = hasPassword && requiresCurrentPassword;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={initialFocusRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{hasPassword ? m.dialogTitle.change : m.dialogTitle.set}</Card.Title>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {form.error}
          </Card.Banner>
          <Card.Content
            render={
              <form
                id={form.id}
                onSubmit={form.handleSubmit}
              />
            }
          >
            <input
              readOnly
              hidden
              name='identifier'
              autoComplete='username'
              value={identifier}
            />
            {showCurrentPassword ? (
              <PasswordField
                autoComplete='current-password'
                form={form}
                inputRef={initialFocusRef}
                label={m.currentPasswordLabel}
                name='currentPassword'
              />
            ) : null}
            <PasswordField
              autoComplete='new-password'
              form={form}
              inputRef={showCurrentPassword ? undefined : initialFocusRef}
              label={m.newPasswordLabel}
              name='newPassword'
              advisoryFeedback={passwordFeedback}
            />
            <PasswordField
              autoComplete='new-password'
              form={form}
              label={m.confirmPasswordLabel}
              name='confirmPassword'
            />
            <Field.Root
              orientation='horizontal'
              disabled={form.isSubmitting}
            >
              <Checkbox
                checked={form.values.signOutOfOtherSessions}
                onChange={event => form.setValue('signOutOfOtherSessions', event.target.checked)}
              />
              <Field.Content>
                <Field.Label>{m.signOutOfOtherSessionsLabel}</Field.Label>
                <Field.Description>{m.signOutOfOtherSessionsDescription}</Field.Description>
              </Field.Content>
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
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
              form={form.id}
              fullWidth
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function PasswordField({
  label,
  autoComplete,
  form,
  inputRef,
  name,
  advisoryFeedback,
}: {
  label: string;
  autoComplete: 'current-password' | 'new-password';
  form: UseFormResult<UserProfileEditPasswordValues>;
  inputRef?: RefObject<HTMLInputElement>;
  name: UserProfileEditPasswordField;
  advisoryFeedback?: FieldFeedback;
}) {
  const m = useMessages('userProfilePasswordSection');
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const { feedback } = form.fields[name];
  const message = feedback?.type === 'error' ? feedback : advisoryFeedback;
  const feedbackType = message?.type === 'info' && !focused ? 'error' : message?.type;
  const { ref, ...control } = form.register(name);
  const mergedRef = useMergeRefs([ref, inputRef]);

  // TODO: Discuss enforcing the configured minimum length on the new password input or keeping the hint advisory and letting the server validate. https://github.com/clerk/javascript/pull/9930#discussion_r4151734254
  return (
    <Field.Root
      disabled={form.isSubmitting}
      focusableWhenDisabled
      invalid={feedbackType === 'error'}
      required
    >
      <Field.Label>{label}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Input
          ref={mergedRef}
          autoComplete={autoComplete}
          type={visible ? 'text' : 'password'}
          {...control}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            control.onBlur();
          }}
        />
        <InputGroup.End>
          <Button
            type='button'
            aria-label={visible ? m.hidePassword : m.showPassword}
            onClick={() => setVisible(current => !current)}
          >
            <Icon name={visible ? 'eye-slash' : 'eye'} />
          </Button>
        </InputGroup.End>
      </InputGroup.Root>
      <Field.Feedback feedback={message && feedbackType ? { ...message, type: feedbackType } : undefined} />
    </Field.Root>
  );
}
