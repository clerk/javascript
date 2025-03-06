import { useClerk, useSession } from '@clerk/shared/react';
import type { SessionVerificationResource } from '@clerk/types';
import React, { useEffect } from 'react';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import { handleError } from '../../utils';
import { useAfterVerification } from './use-after-verification';

type UVFactorOnePasskeysCard = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const UVFactorOnePasskeysCard = (props: UVFactorOnePasskeysCard) => {
  const { onShowAlternativeMethodsClicked } = props;
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();
  // @ts-expect-error - This is not a public API
  const { __internal_isWebAuthnSupported } = useClerk();
  const [prepareResponse, setPrepareResponse] = React.useState<SessionVerificationResource | null>(null);

  const card = useCardState();

  const prepare = async () => {
    const response = await session?.prepareFirstFactorVerification({ strategy: 'passkey' });

    if (response) {
      setPrepareResponse(response);
    }
  };

  useEffect(() => {
    prepare().catch(err => handleError(err, [], card.setError));
  }, []);

  const handlePasskeysAttempt = () => {
    if (!prepareResponse) {
      return;
    }

    const { nonce = null } = prepareResponse.firstFactorVerification;

    if (!nonce) {
      return;
    }

    session!
      .attemptFirstFactorPasskeyVerification(nonce)
      .then(handleVerificationResponse)
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
