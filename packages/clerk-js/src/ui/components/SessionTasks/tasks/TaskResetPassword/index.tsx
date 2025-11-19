import { useClerk, useReverification, useSession } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';

import { useEnvironment, useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { Col, descriptors, Flow, localizationKeys, useLocalizations } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { useConfirmPassword } from '@/ui/hooks';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { withTaskGuard } from './withTaskGuard';

const TaskResetPasswordInternal = () => {
  const { signOut, user } = useClerk();
  const { session } = useSession();
  const card = useCardState();
  const {
    userSettings: { passwordSettings },
    authConfig: { reverification },
  } = useEnvironment();

  const { t, locale } = useLocalizations();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const updatePasswordWithReverification = useReverification(
    (user: UserResource, opts: Parameters<UserResource['updatePassword']>) => user.updatePassword(...opts),
  );

  const currentPasswordRequired = user && user.passwordEnabled && !reverification;

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return signOut(navigateAfterSignOut);
    }

    return signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  // TODO: remove this field
  const currentPasswordField = useFormControl('currentPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__currentPassword'),
    isRequired: true,
  });

  const passwordField = useFormControl('newPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    validatePassword: true,
    buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
  });

  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const sessionsField = useFormControl('signOutOfOtherSessions', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__signOutOfOtherSessions'),
    defaultChecked: true,
  });

  const { setConfirmPasswordFeedback, isPasswordMatch } = useConfirmPassword({
    passwordField,
    confirmPasswordField: confirmField,
  });

  const canSubmit = isPasswordMatch;

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const resetPassword = async () => {
    if (!user) {
      return;
    }
    passwordField.clearFeedback();
    confirmField.clearFeedback();
    try {
      await updatePasswordWithReverification(user, [
        {
          currentPassword: currentPasswordRequired ? currentPasswordField.value : undefined,
          newPassword: passwordField.value,
          signOutOfOtherSessions: sessionsField.checked,
        },
      ]);
    } catch (e) {
      return handleError(e, [currentPasswordField, passwordField, confirmField], card.setError);
    }
  };

  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
    <Flow.Root flow='taskResetPassword'>
      <Flow.Part part='resetPassword'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
            </Header.Root>
            <Card.Alert>{card.error}</Card.Alert>
            <Col
              elementDescriptor={descriptors.main}
              gap={8}
            >
              <Form.Root
                onSubmit={() => {
                  void resetPassword();
                }}
                onBlur={validateForm}
                gap={8}
              >
                <Col gap={6}>
                  {/* For password managers */}
                  <input
                    readOnly
                    data-testid='hidden-identifier'
                    id='identifier-field'
                    name='identifier'
                    value={session?.publicUserData.identifier || ''}
                    style={{ display: 'none' }}
                  />
                  {currentPasswordRequired && (
                    <Form.ControlRow elementId={currentPasswordField.id}>
                      <Form.PasswordInput
                        {...currentPasswordField.props}
                        minLength={6}
                        isRequired
                        autoFocus
                      />
                    </Form.ControlRow>
                  )}
                  <Form.ControlRow elementId={passwordField.id}>
                    <Form.PasswordInput
                      {...passwordField.props}
                      isRequired
                      minLength={6}
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
                    />
                  </Form.ControlRow>
                  <Form.ControlRow elementId={sessionsField.id}>
                    <Form.Checkbox {...sessionsField.props} />
                  </Form.ControlRow>
                </Col>
                <Col gap={3}>
                  <Form.SubmitButton
                    isDisabled={!canSubmit}
                    localizationKey={localizationKeys('signIn.resetPassword.formButtonPrimary')}
                  />
                </Col>
              </Form.Root>
            </Col>
          </Card.Content>

          <Card.Footer>
            <Card.Action
              elementId='signOut'
              gap={2}
              justify='center'
              sx={() => ({ width: '100%' })}
            >
              {identifier && (
                <Card.ActionText
                  truncate
                  localizationKey={localizationKeys('taskChooseOrganization.signOut.actionText', {
                    identifier,
                  })}
                />
              )}
              <Card.ActionLink
                sx={() => ({ flexShrink: 0 })}
                onClick={() => {
                  void handleSignOut();
                }}
                localizationKey={localizationKeys('taskChooseOrganization.signOut.actionLink')}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

export const TaskResetPassword = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskResetPasswordInternal)),
);
