import { useSession } from '@clerk/shared/react';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys, useLocalizations } from '../../customizables';
import { useConfirmPassword } from '../../hooks';
import type { UserVerificationResetPassword } from './utils';

type UVResetPasswordCardProps = {
  initialPassword: string;
  initialSignOutOfOtherSessions: boolean;
  showSignOutOfOtherSessions: boolean;
  /** The rejection of the last new password, shown on the password field. */
  initialError: Error | undefined;
  onSubmit: (values: UserVerificationResetPassword) => void;
  onBackLinkClick: () => void;
};

/**
 * Collects the new password. It's sent together with the reset password code,
 * on the next step.
 */
const UVResetPasswordCardInternal = (props: UVResetPasswordCardProps) => {
  const {
    initialPassword,
    initialSignOutOfOtherSessions,
    showSignOutOfOtherSessions,
    initialError,
    onSubmit,
    onBackLinkClick,
  } = props;
  const card = useCardState();
  const { session } = useSession();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();
  const { t, locale } = useLocalizations();

  const passwordField = useFormControl('password', initialPassword, {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    validatePassword: true,
    buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
  });

  const confirmField = useFormControl('confirmPassword', initialPassword, {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const sessionsField = useFormControl('signOutOfOtherSessions', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__signOutOfOtherSessions'),
    defaultChecked: initialSignOutOfOtherSessions,
  });

  const { setConfirmPasswordFeedback, isPasswordMatch } = useConfirmPassword({
    passwordField,
    confirmPasswordField: confirmField,
  });

  React.useEffect(() => {
    if (initialError) {
      handleError(initialError, [passwordField], card.setError);
    }
  }, []);

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const submit = () => {
    if (!isPasswordMatch) {
      return;
    }
    onSubmit({ password: passwordField.value, signOutOfOtherSessions: !!sessionsField.checked });
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('reverification.resetPassword.title')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root
            onSubmit={submit}
            onBlur={validateForm}
            gap={8}
          >
            {/* For password managers */}
            <input
              readOnly
              data-testid='hidden-identifier'
              id='identifier-field'
              name='identifier'
              value={session?.publicUserData.identifier || ''}
              style={{ display: 'none' }}
            />
            <Col gap={6}>
              <Form.ControlRow elementId={passwordField.id}>
                <Form.PasswordInput
                  {...passwordField.props}
                  isRequired
                  autoFocus
                  autoComplete='new-password'
                />
              </Form.ControlRow>
              <Form.ControlRow elementId={confirmField.id}>
                <Form.PasswordInput
                  {...confirmField.props}
                  onChange={e => {
                    if (e.target.value) {
                      setConfirmPasswordFeedback(e.target.value);
                    }
                    return confirmField.props.onChange(e);
                  }}
                  autoComplete='new-password'
                />
              </Form.ControlRow>
              {showSignOutOfOtherSessions && (
                <Form.ControlRow elementId={sessionsField.id}>
                  <Form.Checkbox {...sessionsField.props} />
                </Form.ControlRow>
              )}
            </Col>
            <Col gap={3}>
              <Form.SubmitButton
                isDisabled={!isPasswordMatch}
                localizationKey={localizationKeys('reverification.resetPassword.formButtonPrimary')}
              />
              <Card.Action elementId='alternativeMethods'>
                <Card.ActionLink
                  elementDescriptor={descriptors.backLink}
                  localizationKey={localizationKeys('backButton')}
                  onClick={onBackLinkClick}
                />
              </Card.Action>
            </Col>
          </Form.Root>
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

export const UVResetPasswordCard = withCardStateProvider(UVResetPasswordCardInternal);
