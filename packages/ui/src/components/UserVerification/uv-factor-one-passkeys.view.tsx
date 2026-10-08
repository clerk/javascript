import React from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import type { useUVFactorOnePasskeysController } from './uv-factor-one-passkeys.controller';

export const UVFactorOnePasskeysView = ({
  controller,
  onShowAlternativeMethodsClicked,
}: {
  controller: ReturnType<typeof useUVFactorOnePasskeysController>;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
}) => {
  const { error, handlePasskeysAttempt } = controller;
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('reverification.passkey.title')} />
          <Header.Subtitle localizationKey={localizationKeys('reverification.passkey.subtitle')} />
        </Header.Root>
        <Card.Alert>{error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root>
            <Col gap={3}>
              <Button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  handlePasskeysAttempt();
                }}
                localizationKey={localizationKeys('reverification.passkey.blockButton__passkey')}
                hasArrow
              />
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
