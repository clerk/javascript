import React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, localizationKeys } from '../../customizables';
import type { useUVFactorTwoBackupCodeController } from './uv-factor-two-backup-code.controller';

export const UVFactorTwoBackupCodeView = ({
  controller,
  onShowAlternativeMethodsClicked,
}: {
  controller: ReturnType<typeof useUVFactorTwoBackupCodeController>;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
}) => {
  const { codeControl, handleBackupCodeSubmit, error } = controller;
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('reverification.backupCodeMfa.title')} />
          <Header.Subtitle localizationKey={localizationKeys('reverification.backupCodeMfa.subtitle')} />
        </Header.Root>
        <Card.Alert>{error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root onSubmit={handleBackupCodeSubmit}>
            <Form.ControlRow elementId={codeControl.id}>
              <Form.PlainInput
                {...codeControl.props}
                autoFocus
                onActionClicked={onShowAlternativeMethodsClicked}
              />
            </Form.ControlRow>
            <Col gap={3}>
              <Form.SubmitButton hasArrow />
              <Card.Action elementId='alternativeMethods'>
                {onShowAlternativeMethodsClicked && (
                  <Card.ActionLink
                    localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
                    onClick={onShowAlternativeMethodsClicked}
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
};
