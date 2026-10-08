import { Col, descriptors, Flow, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import type { useTaskResetPasswordController } from './task-reset-password.controller';

export const TaskResetPasswordView = ({
  controller,
}: {
  controller: ReturnType<typeof useTaskResetPasswordController>;
}) => (
  <Flow.Root flow='taskResetPassword'>
    <Flow.Part part='resetPassword'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('taskResetPassword.title')} />
            <Header.Subtitle localizationKey={localizationKeys('taskResetPassword.subtitle')} />
          </Header.Root>
          <Card.Alert>{controller.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={8}
          >
            <Form.Root
              onSubmit={controller.resetPassword}
              onBlur={controller.validateForm}
              gap={8}
            >
              <Col gap={6}>
                {/* For password managers */}
                <input
                  readOnly
                  data-testid='hidden-identifier'
                  id='identifier-field'
                  name='identifier'
                  value={controller.hiddenIdentifier}
                  style={{ display: 'none' }}
                />
                <Form.ControlRow elementId={controller.passwordField.id}>
                  <Form.PasswordInput
                    {...controller.passwordField.props}
                    isRequired
                    minLength={6}
                  />
                </Form.ControlRow>
                <Form.ControlRow elementId={controller.confirmField.id}>
                  <Form.PasswordInput
                    {...controller.confirmField.props}
                    onChange={controller.onConfirmChange}
                    autoComplete='new-password'
                  />
                </Form.ControlRow>
                <Form.ControlRow elementId={controller.sessionsField.id}>
                  <Form.Checkbox {...controller.sessionsField.props} />
                </Form.ControlRow>
              </Col>
              <Col gap={3}>
                <Form.SubmitButton
                  isLoading={controller.isLoading}
                  isDisabled={!controller.canSubmit}
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
            {controller.identifier && (
              <Card.ActionText
                truncate
                localizationKey={localizationKeys('taskResetPassword.signOut.actionText', {
                  identifier: controller.identifier,
                })}
              />
            )}
            <Card.ActionLink
              sx={() => ({ flexShrink: 0 })}
              onClick={() => {
                void controller.signOut();
              }}
              localizationKey={localizationKeys('taskResetPassword.signOut.actionLink')}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  </Flow.Root>
);
