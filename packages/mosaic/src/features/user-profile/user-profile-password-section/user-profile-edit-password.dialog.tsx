import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { RefObject } from 'react';
import { useId, useRef, useState } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { UseFormResult } from '../../../components/form';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from './user-profile-password-section.styles';
import type {
  UserProfileEditPasswordField,
  UserProfileEditPasswordValues,
} from './user-profile-password-section.types';

export interface UserProfileEditPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  form: UseFormResult<UserProfileEditPasswordValues>;
}

export function UserProfileEditPasswordDialog({
  open,
  onOpenChange,
  trigger,
  hasPassword = false,
  requiresCurrentPassword = false,
  form,
}: UserProfileEditPasswordDialogProps) {
  const m = useMessages('userProfilePasswordSection');
  const signOutId = useId();
  const signOutDescriptionId = useId();
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
          <Card.Content
            render={
              <form
                id={form.id}
                onSubmit={form.handleSubmit}
              />
            }
          >
            {form.error ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{form.error}</Banner.Label>
              </Banner.Root>
            ) : null}
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
            />
            <PasswordField
              autoComplete='new-password'
              form={form}
              label={m.confirmPasswordLabel}
              name='confirmPassword'
            />
            <div {...stylex.props(styles.checkboxField)}>
              <input
                aria-describedby={signOutDescriptionId}
                checked={form.values.signOutOfOtherSessions}
                disabled={form.isSubmitting}
                id={signOutId}
                type='checkbox'
                {...stylex.props(styles.checkbox)}
                onChange={event => form.setValue('signOutOfOtherSessions', event.target.checked)}
              />
              <div {...stylex.props(styles.checkboxCopy)}>
                <Text
                  render={<label htmlFor={signOutId} />}
                  size='sm'
                  xstyle={styles.checkboxLabel}
                >
                  {m.signOutOfOtherSessionsLabel}
                </Text>
                <Text
                  id={signOutDescriptionId}
                  size='xs'
                  xstyle={styles.checkboxDescription}
                >
                  {m.signOutOfOtherSessionsDescription}
                </Text>
              </div>
            </div>
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
}: {
  label: string;
  autoComplete: 'current-password' | 'new-password';
  form: UseFormResult<UserProfileEditPasswordValues>;
  inputRef?: RefObject<HTMLInputElement>;
  name: UserProfileEditPasswordField;
}) {
  const m = useMessages('userProfilePasswordSection');
  const [visible, setVisible] = useState(false);
  const { feedback } = form.fields[name];
  const error = feedback?.type === 'error' ? feedback.message : undefined;
  const { ref, ...control } = form.register(name);
  const mergedRef = useMergeRefs([ref, inputRef]);

  return (
    <Field.Root
      disabled={form.isSubmitting}
      invalid={error !== undefined}
      required
    >
      <Field.Label>{label}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Input
          ref={mergedRef}
          autoComplete={autoComplete}
          type={visible ? 'text' : 'password'}
          {...control}
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
      {error ? <Field.Error>{error}</Field.Error> : null}
    </Field.Root>
  );
}
