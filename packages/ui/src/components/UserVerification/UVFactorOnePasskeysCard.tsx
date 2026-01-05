import { useClerk, useSession } from '@clerk/shared/react';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import { useAfterVerification } from './use-after-verification';

type UVFactorOnePasskeysCard = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const UVFactorOnePasskeysCard = (props: UVFactorOnePasskeysCard) => {
  const { onShowAlternativeMethodsClicked } = props;
  const { session } = useSession();
  // @ts-expect-error - This is not a public API
  const { __internal_isWebAuthnSupported } = useClerk();
  const { handleVerificationResponse } = useAfterVerification();

  const card = useCardState();

  const handlePasskeysAttempt = () => {
    session
      ?.verifyWithPasskey()
      .then(response => {
        return handleVerificationResponse(response);
      })
      .catch(err => handleError(err, [], card.setError));

    return;
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('reverification.passkey.title')} />
          <Header.Subtitle localizationKey={localizationKeys('reverification.passkey.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
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
