import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { Button, SubmitButton } from '../components/button';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Input } from '../components/input';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfilePasswordFlowActions, UserProfilePasswordFlowState } from './dialogs/flow.types';
import { DialogBody, DialogFooter, DialogForm, DialogHeader, FormAlert } from './dialogs/flow-dialog-chrome';
import { passwordDialogStyles as styles } from './user-profile-password-dialog.styles';

export type {
  UserProfilePasswordField,
  UserProfilePasswordMode,
  UserProfilePasswordValues,
} from './dialogs/flow.types';

export interface UserProfilePasswordDialogViewProps extends UserProfilePasswordFlowActions {
  state: UserProfilePasswordFlowState;
  isInterrupted?: boolean;
}

export function UserProfilePasswordDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onValueChange,
  onSubmit,
}: UserProfilePasswordDialogViewProps) {
  const { values, mode, isSubmitting, errors } = state;
  const locked = Boolean(state.isReadOnly) || isSubmitting;
  const canSubmit =
    (!state.requiresCurrentPassword || Boolean(values.currentPassword)) &&
    values.newPassword.length >= (state.minimumLength ?? 1) &&
    values.newPassword === values.confirmPassword;
  const title = mode === 'set' ? 'Set password' : 'Change password';
  const submit = () => {
    if (canSubmit && !isSubmitting && !state.isReadOnly) {
      onSubmit(values);
    }
  };

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <Dialog.CloseButton />
      <DialogHeader title={title} />
      <DialogForm onSubmit={submit}>
        <DialogBody>
          {state.signedInIdentifier ? (
            <input
              readOnly
              hidden
              autoComplete='username'
              name='identifier'
              value={state.signedInIdentifier}
            />
          ) : null}
          <div {...mergeStyleProps(themeProps('user-profile-password-dialog-fields'), stylex.props(styles.fields))}>
            {state.isReadOnly ? (
              <Text color='neutral'>Your password is managed by your enterprise connection.</Text>
            ) : null}
            {state.requiresCurrentPassword ? (
              <PasswordField
                name='currentPassword'
                label='Current password'
                autoComplete='current-password'
                value={values.currentPassword ?? ''}
                error={errors.currentPassword}
                disabled={locked}
                onChange={value => onValueChange('currentPassword', value)}
              />
            ) : null}
            <PasswordField
              name='newPassword'
              label='New password'
              autoComplete='new-password'
              value={values.newPassword}
              error={errors.newPassword}
              disabled={locked}
              onChange={value => onValueChange('newPassword', value)}
            />
            <PasswordField
              name='confirmPassword'
              label='Confirm password'
              autoComplete='new-password'
              value={values.confirmPassword}
              error={errors.confirmPassword}
              disabled={locked}
              onChange={value => onValueChange('confirmPassword', value)}
            />
            <SignOutOfOtherSessionsField
              checked={values.signOutOfOtherSessions}
              disabled={locked}
              onChange={checked => onValueChange('signOutOfOtherSessions', checked)}
            />
            <FormAlert>{errors.form}</FormAlert>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            {...stylex.props(styles.footerButton)}
            type='button'
            variant='outline'
            onClick={onCancel}
          >
            Cancel
          </Button>
          {state.isReadOnly ? null : (
            <SubmitButton
              disabled={!canSubmit}
              isPending={isSubmitting}
              pendingLabel={mode === 'set' ? 'Setting password' : 'Changing password'}
              {...stylex.props(styles.footerButton)}
            >
              {title}
            </SubmitButton>
          )}
        </DialogFooter>
      </DialogForm>
    </div>
  );
}

interface SignOutOfOtherSessionsFieldProps {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function SignOutOfOtherSessionsField({ checked, disabled, onChange }: SignOutOfOtherSessionsFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <Field.Root disabled={disabled}>
      <Field.Label
        htmlFor={id}
        {...stylex.props(styles.checkboxRow, disabled && styles.checkboxRowDisabled)}
      >
        {/* TODO: Replace the native checkbox with Mosaic Checkbox once it is available. */}
        <input
          id={id}
          name='signOutOfOtherSessions'
          type='checkbox'
          checked={checked}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          onChange={event => onChange(event.target.checked)}
          {...stylex.props(styles.checkbox)}
        />
        <span {...stylex.props(styles.checkboxCopy)}>
          <span id={labelId}>Sign out of all other devices</span>
          <Field.Description
            id={descriptionId}
            render={<span />}
          >
            It is recommended to sign out of all other devices which may have used your old password.
          </Field.Description>
        </span>
      </Field.Label>
    </Field.Root>
  );
}

interface PasswordFieldProps {
  name: 'currentPassword' | 'newPassword' | 'confirmPassword';
  label: string;
  autoComplete: 'current-password' | 'new-password';
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function PasswordField({ name, label, autoComplete, value, error, disabled, onChange }: PasswordFieldProps) {
  return (
    <Field.Root
      required
      invalid={Boolean(error)}
      disabled={disabled}
      {...stylex.props(styles.field)}
    >
      <Field.Label>{label}</Field.Label>
      <Input
        name={name}
        type='password'
        autoComplete={autoComplete}
        spellCheck={false}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      {error ? <Field.Error>{error}</Field.Error> : null}
    </Field.Root>
  );
}
