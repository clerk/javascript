import { __internal_WebAuthnAbortService } from '@clerk/shared/internal/clerk-js/passkeys';
import { useSession } from '@clerk/shared/react';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import { useAfterVerification } from './use-after-verification';

type UVFactorTwoPasskeyCardProps = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  showAlternativeMethods?: boolean;
};

export const UVFactorTwoPasskeyCard = (props: UVFactorTwoPasskeyCardProps) => {
  const { onShowAlternativeMethodsClicked, showAlternativeMethods } = props;
  const { session } = useSession();
  const { handleVerificationResponse } = useAfterVerification();

  const card = useCardState();

  React.useEffect(() => {
    return () => {
      __internal_WebAuthnAbortService.abort();
    };
  }, []);

  const handlePasskeysAttempt = () => {
    session
      ?.verifyWithPasskey({ level: 'second_factor' })
      .then(response => {
        return handleVerificationResponse(response);
      })
      .catch(err => handleError(err, [], card.setError));

    return;
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('reverification.passkeyMfa.title')} />
          <Header.Subtitle localizationKey={localizationKeys('reverification.passkeyMfa.subtitle')} />
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
                localizationKey={localizationKeys('reverification.passkeyMfa.blockButton__passkey')}
                hasArrow
              />
              <Card.Action elementId='alternativeMethods'>
                {showAlternativeMethods && onShowAlternativeMethodsClicked && (
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
