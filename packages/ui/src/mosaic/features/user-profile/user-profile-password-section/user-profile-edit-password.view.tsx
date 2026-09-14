import * as stylex from '@stylexjs/stylex';
import type { FormEvent, RefObject } from 'react';
import { useId, useRef, useState } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { Text } from '../../../components/text';
import type { UserProfileFormError } from '../user-profile-account-section/user-profile-account-section.types';
import { userProfilePasswordSectionBase as m } from './user-profile-password-section.messages';
import { styles } from './user-profile-password-section.styles';

export type UserProfileEditPasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export interface UserProfileEditPasswordValue {
  /** Only carried when the flow asked for it. */
  currentPassword?: string;
  newPassword: string;
  signOutOfOtherSessions: boolean;
}

export interface UserProfileEditPasswordViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendering the opener here is what returns focus to it on close. */
  trigger?: DialogTriggerProps['render'];
  /** Whether a password is being replaced or set for the first time. Decides the copy. */
  hasPassword?: boolean;
  /** Asks for the password being replaced. Off when reverification stands in for it. */
  requiresCurrentPassword?: boolean;
  /**
   * The password cannot change while the account signs in only through an enterprise connection.
   * The dialog still opens so it can say so, but every field is inert and only cancel remains.
   */
  isReadOnly?: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSignOutOfOtherSessionsChange: (value: boolean) => void;
  canSave?: boolean;
  isSaving?: boolean;
  error?: UserProfileFormError<UserProfileEditPasswordField>;
  onSubmit: () => void;
}

/**
 * Sets or replaces the user's password. Holds nothing, and validates nothing itself: whether the
 * halves match and whether the new password is acceptable arrive as `canSave` and `error`, so the
 * rules live in one place and a rejection from the API lands the same way a local one does.
 */
export function UserProfileEditPasswordView({
  open,
  onOpenChange,
  trigger,
  hasPassword = false,
  requiresCurrentPassword = false,
  isReadOnly = false,
  currentPassword,
  newPassword,
  confirmPassword,
  signOutOfOtherSessions,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSignOutOfOtherSessionsChange,
  canSave = true,
  isSaving = false,
  error,
  onSubmit,
}: UserProfileEditPasswordViewProps) {
  const formId = useId();
  const signOutId = useId();
  const signOutDescriptionId = useId();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const showCurrentPassword = hasPassword && requiresCurrentPassword;
  const inert = isSaving || isReadOnly;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && !inert) {
      onSubmit();
    }
  };

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        size='card'
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
                id={formId}
                onSubmit={handleSubmit}
              />
            }
          >
            {isReadOnly ? (
              <Banner.Root color='neutral'>
                <Banner.Label>{m.readOnly}</Banner.Label>
              </Banner.Root>
            ) : null}
            {error?.message ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{error.message}</Banner.Label>
              </Banner.Root>
            ) : null}
            {showCurrentPassword ? (
              <PasswordField
                autoComplete='current-password'
                disabled={inert}
                error={error?.fields?.currentPassword}
                inputRef={initialFocusRef}
                label={m.currentPasswordLabel}
                value={currentPassword}
                onChange={onCurrentPasswordChange}
              />
            ) : null}
            <PasswordField
              autoComplete='new-password'
              disabled={inert}
              error={error?.fields?.newPassword}
              inputRef={showCurrentPassword ? undefined : initialFocusRef}
              label={m.newPasswordLabel}
              value={newPassword}
              onChange={onNewPasswordChange}
            />
            <PasswordField
              autoComplete='new-password'
              disabled={inert}
              error={error?.fields?.confirmPassword}
              label={m.confirmPasswordLabel}
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
            />
            <div {...stylex.props(styles.checkboxField)}>
              <input
                aria-describedby={signOutDescriptionId}
                checked={signOutOfOtherSessions}
                disabled={inert}
                id={signOutId}
                type='checkbox'
                {...stylex.props(styles.checkbox)}
                onChange={event => onSignOutOfOtherSessionsChange(event.target.checked)}
              />
              <div {...stylex.props(styles.checkboxCopy)}>
                <Text
                  render={<label htmlFor={signOutId} />}
                  size='sm'
                  {...stylex.props(styles.checkboxLabel)}
                >
                  {m.signOutOfOtherSessionsLabel}
                </Text>
                <Text
                  id={signOutDescriptionId}
                  size='xs'
                  {...stylex.props(styles.checkboxDescription)}
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
            {isReadOnly ? null : (
              <SubmitButton
                form={formId}
                fullWidth
                isPending={isSaving}
                disabled={!canSave}
                focusableWhenDisabled
              >
                {m.save}
              </SubmitButton>
            )}
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function PasswordField({
  label,
  autoComplete,
  disabled,
  error,
  inputRef,
  value,
  onChange,
}: {
  label: string;
  autoComplete: 'current-password' | 'new-password';
  disabled: boolean;
  error?: string;
  inputRef?: RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field.Root
      disabled={disabled}
      invalid={Boolean(error)}
      required
    >
      <Field.Label>{label}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Input
          ref={inputRef}
          autoComplete={autoComplete}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
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
