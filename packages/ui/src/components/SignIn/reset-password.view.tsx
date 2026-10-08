import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, localizationKeys } from '../../customizables';
import type { useResetPasswordController } from './reset-password.controller';

export type ResetPasswordViewProps = ReturnType<typeof useResetPasswordController>;

export function ResetPasswordView(props: ResetPasswordViewProps) {
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
        </Header.Root>
        <Card.Alert>{props.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root
            onSubmit={props.resetPassword}
            onBlur={props.validateForm}
            gap={8}
          >
            <Col gap={6}>
              {/* For password managers */}
              <input
                readOnly
                data-testid='hidden-identifier'
                id='identifier-field'
                name='identifier'
                value={props.identifier || ''}
                style={{ display: 'none' }}
              />
              <Form.ControlRow elementId={props.passwordField.id}>
                <Form.PasswordInput
                  {...props.passwordField.props}
                  isRequired
                  autoFocus
                  autoComplete='new-password'
                />
              </Form.ControlRow>
              <Form.ControlRow elementId={props.confirmField.id}>
                <Form.PasswordInput
                  {...props.confirmField.props}
                  onChange={event => {
                    if (event.target.value) {
                      props.setConfirmPasswordFeedback(event.target.value);
                    }
                    return props.confirmField.props.onChange(event);
                  }}
                  autoComplete='new-password'
                />
              </Form.ControlRow>
              {!props.requiresNewPassword && (
                <Form.ControlRow elementId={props.sessionsField.id}>
                  <Form.Checkbox {...props.sessionsField.props} />
                </Form.ControlRow>
              )}
            </Col>
            <Col gap={3}>
              <Form.SubmitButton
                isDisabled={!props.canSubmit}
                localizationKey={localizationKeys('signIn.resetPassword.formButtonPrimary')}
              />
              <Card.Action elementId='alternativeMethods'>
                <Card.ActionLink
                  elementDescriptor={descriptors.backLink}
                  localizationKey={localizationKeys('backButton')}
                  onClick={props.goBack}
                />
              </Card.Action>
            </Col>
          </Form.Root>
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}
