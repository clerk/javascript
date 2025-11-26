import { useClerk, useReverification } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';
import { useCallback } from 'react';

import { useEnvironment, useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useTaskResetPasswordContext } from '@/ui/contexts/components/SessionTasks';
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
  const clerk = useClerk();
  const card = useCardState();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const { t, locale } = useLocalizations();
  const { redirectUrlComplete } = useTaskResetPasswordContext();
  const { otherSessions } = useMultipleSessions({ user: clerk.user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const updatePasswordWithReverification = useReverification(
    (user: UserResource, opts: Parameters<UserResource['updatePassword']>) => user.updatePassword(...opts),
  );

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk?.signOut(navigateAfterSignOut);
    }

    return clerk?.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: clerk.session?.id });
  };

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

  const resetPassword = useCallback(async () => {
    if (!clerk.user) {
      return;
    }
    passwordField.clearFeedback();
    confirmField.clearFeedback();
    try {
      await updatePasswordWithReverification(clerk.user, [
        {
          newPassword: passwordField.value,
          signOutOfOtherSessions: sessionsField.checked,
        },
      ]);

      // Handle the next task if it exists or redirect to the complete url
      const task = clerk.session?.currentTask;
      if (task && task.key !== 'reset-password') {
        await clerk?.navigate(
          clerk.buildTasksUrl({
            redirectUrl: redirectUrlComplete,
          }),
        );
        return;
      }

      await clerk?.navigate(redirectUrlComplete);
    } catch (e) {
      return handleError(e, [passwordField, confirmField], card.setError);
    }
  }, [
    clerk,
    passwordField,
    confirmField,
    updatePasswordWithReverification,
    sessionsField.checked,
    redirectUrlComplete,
    card.setError,
  ]);

  const identifier = clerk.user?.primaryEmailAddress?.emailAddress ?? clerk.user?.username;

  return (
    <Flow.Root flow='taskResetPassword'>
      <Flow.Part part='resetPassword'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={localizationKeys('taskResetPassword.title')} />
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
                    value={clerk.user?.primaryEmailAddress?.emailAddress || clerk.user?.username || ''}
                    style={{ display: 'none' }}
                  />
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
                    localizationKey={localizationKeys('taskResetPassword.formButtonPrimary')}
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
                  localizationKey={localizationKeys('taskResetPassword.signOut.actionText', {
                    identifier,
                  })}
                />
              )}
              <Card.ActionLink
                sx={() => ({ flexShrink: 0 })}
                onClick={() => {
                  void handleSignOut();
                }}
                localizationKey={localizationKeys('taskResetPassword.signOut.actionLink')}
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
