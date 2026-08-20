import * as stylex from '@stylexjs/stylex';
import { type FormEvent, type ReactNode, useId } from 'react';

import { Button } from '../components/button';
import { Card } from '../components/card';
import { Dialog, type DialogProps } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { mergeStyleProps, themeProps } from '../props';
import { passwordDialogStyles as styles } from './user-profile-password-dialog.styles';

export interface UserProfilePasswordValues {
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
}

export type UserProfilePasswordField = keyof UserProfilePasswordValues;
export type UserProfilePasswordMode = 'change' | 'set';

export interface UserProfilePasswordDialogViewProps extends Pick<DialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  values: UserProfilePasswordValues;
  mode?: UserProfilePasswordMode;
  canSubmit?: boolean;
  submitting?: boolean;
  errors?: Partial<Record<UserProfilePasswordField, string>>;
  /** A verification prompt rendered inside the password dialog's stacking context. */
  verificationDialog?: ReactNode;
  onValueChange: <Field extends UserProfilePasswordField>(
    field: Field,
    value: UserProfilePasswordValues[Field],
  ) => void;
  onSubmit: (values: UserProfilePasswordValues) => void;
}

export function UserProfilePasswordDialogView({
  values,
  mode = 'change',
  canSubmit = false,
  submitting = false,
  errors = {},
  verificationDialog,
  onValueChange,
  onSubmit,
  ...dialogProps
}: UserProfilePasswordDialogViewProps) {
  const title = mode === 'set' ? 'Set password' : 'Change password';
  const submittingLabel = mode === 'set' ? 'Setting…' : 'Changing…';
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !submitting) {
      onSubmit(values);
    }
  };

  return (
    <Dialog.Root
      size='card'
      closedBy='closerequest'
      {...dialogProps}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            <Dialog.CloseButton />
            <form
              onSubmit={submit}
              {...mergeStyleProps(themeProps('user-profile-password-dialog-form'), stylex.props(styles.form))}
            >
              <Card.Header>
                <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
              </Card.Header>
              <Card.Content>
                <div
                  {...mergeStyleProps(themeProps('user-profile-password-dialog-fields'), stylex.props(styles.fields))}
                >
                  <PasswordField
                    name='newPassword'
                    label='New password'
                    autoComplete='new-password'
                    value={values.newPassword}
                    error={errors.newPassword}
                    disabled={submitting}
                    onChange={value => onValueChange('newPassword', value)}
                  />
                  <PasswordField
                    name='confirmPassword'
                    label='Confirm password'
                    autoComplete='new-password'
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    disabled={submitting}
                    onChange={value => onValueChange('confirmPassword', value)}
                  />
                  <SignOutOfOtherSessionsField
                    checked={values.signOutOfOtherSessions}
                    disabled={submitting}
                    onChange={checked => onValueChange('signOutOfOtherSessions', checked)}
                  />
                </div>
              </Card.Content>
              <Card.Footer {...themeProps('user-profile-password-dialog-actions')}>
                <Dialog.Close
                  render={props => (
                    <Button
                      {...props}
                      {...mergeStyleProps(stylex.props(styles.footerButton), props.className, props.style)}
                      variant='outline'
                    >
                      Cancel
                    </Button>
                  )}
                />
                <Button
                  type='submit'
                  disabled={!canSubmit || submitting}
                  focusableWhenDisabled
                  {...stylex.props(styles.footerButton)}
                >
                  {submitting ? submittingLabel : title}
                </Button>
              </Card.Footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
      {verificationDialog}
    </Dialog.Root>
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
