import * as stylex from '@stylexjs/stylex';
import { type FormEvent, useId } from 'react';

import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfilePasswordFlowActions, UserProfilePasswordFlowState } from './dialogs/flow.types';
import { passwordDialogStyles as styles } from './user-profile-password-dialog.styles';

export type {
  UserProfilePasswordField,
  UserProfilePasswordMode,
  UserProfilePasswordValues,
} from './dialogs/flow.types';

export interface UserProfilePasswordDialogViewProps extends UserProfilePasswordFlowActions {
  state: UserProfilePasswordFlowState;
  canSubmit?: boolean;
  isInterrupted?: boolean;
}

export function UserProfilePasswordDialogView({
  state,
  canSubmit = false,
  isInterrupted = false,
  onCancel,
  onValueChange,
  onSubmit,
}: UserProfilePasswordDialogViewProps) {
  const { values, mode, isSubmitting, errors } = state;
  const locked = Boolean(state.isReadOnly) || isSubmitting;
  const title = mode === 'set' ? 'Set password' : 'Change password';
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isSubmitting && !state.isReadOnly) {
      onSubmit(values);
    }
  };

  return (
    <form
      aria-hidden={isInterrupted || undefined}
      onSubmit={submit}
      {...mergeStyleProps(themeProps('user-profile-password-dialog-form'), stylex.props(styles.form))}
    >
      <Dialog.CloseButton />
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
      </Card.Header>
      <Card.Content>
        <div {...mergeStyleProps(themeProps('user-profile-password-dialog-fields'), stylex.props(styles.fields))}>
          {state.isReadOnly ? (
            <Text color='neutral'>Your password is managed by your enterprise connection.</Text>
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
          {errors.form ? (
            <Text
              color='negative'
              role='alert'
            >
              {errors.form}
            </Text>
          ) : null}
        </div>
      </Card.Content>
      <Card.Footer {...themeProps('user-profile-password-dialog-actions')}>
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
      </Card.Footer>
    </form>
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
  name: 'newPassword' | 'confirmPassword';
  label: string;
  autoComplete: 'new-password';
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
