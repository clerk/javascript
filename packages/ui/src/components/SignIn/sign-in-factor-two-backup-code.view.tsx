import type React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, localizationKeys } from '../../customizables';
import type { useSignInFactorTwoBackupCodeController } from './sign-in-factor-two-backup-code.controller';

type BackupCodeControl = ReturnType<typeof useSignInFactorTwoBackupCodeController>['codeControl'];

export type SignInFactorTwoBackupCodeViewProps = {
  isResettingPassword: boolean;
  error: React.ReactNode;
  codeControl: BackupCodeControl;
  handleSubmit: React.FormEventHandler;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export function SignInFactorTwoBackupCodeView(props: SignInFactorTwoBackupCodeViewProps) {
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.backupCodeMfa.title')} />
          <Header.Subtitle
            localizationKey={
              props.isResettingPassword
                ? localizationKeys('signIn.forgotPassword.subtitle')
                : localizationKeys('signIn.backupCodeMfa.subtitle')
            }
          />
        </Header.Root>
        <Card.Alert>{props.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root onSubmit={props.handleSubmit}>
            <Form.ControlRow elementId={props.codeControl.id}>
              <Form.PlainInput
                {...props.codeControl.props}
                autoFocus
                onActionClicked={props.onShowAlternativeMethodsClicked}
              />
            </Form.ControlRow>
            <Col gap={3}>
              <Form.SubmitButton hasArrow />
              <Card.Action elementId='alternativeMethods'>
                {props.onShowAlternativeMethodsClicked && (
                  <Card.ActionLink
                    localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
                    onClick={props.onShowAlternativeMethodsClicked}
                  />
                )}
              </Card.Action>
            </Col>
          </Form.Root>
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}
