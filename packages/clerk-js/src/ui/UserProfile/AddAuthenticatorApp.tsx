import { TOTPResource } from '@clerk/types';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

import { useCoreUser } from '../contexts';
import { Button, Col, Spinner, Text } from '../customizables';
import { ClipboardInput, useCardState } from '../elements';
import { handleError } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

type AddAuthenticatorAppProps = {
  title: string;
  onContinue: () => void;
};

type DisplayFormat = 'qr' | 'uri';

export const AddAuthenticatorApp = (props: AddAuthenticatorAppProps) => {
  const { title, onContinue } = props;
  const user = useCoreUser();
  const card = useCardState();
  const [totp, setTOTP] = React.useState<TOTPResource | undefined>(undefined);
  const [displayFormat, setDisplayFormat] = React.useState<DisplayFormat>('qr');

  // TODO: React18
  // Non-idempotent useEffect
  React.useEffect(() => {
    void user
      .createTOTP()
      .then((totp: TOTPResource) => setTOTP(totp))
      .catch(err => handleError(err, [], card.setError));
  }, []);

  if (card.error) {
    return <ContentPage.Root headerTitle={title} />;
  }

  return (
    <ContentPage.Root headerTitle={title}>
      {!totp && (
        <Spinner
          colorScheme='primary'
          size='lg'
        />
      )}

      {totp && (
        <>
          <Col gap={4}>
            {displayFormat == 'qr' && (
              <>
                <Text>
                  Set up a new sign-in method in your authenticator app and scan the following QR code to link it to
                  your account.
                </Text>

                <QRCodeSVG
                  size={200}
                  value={totp.uri || ''}
                />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('uri')}
                >
                  Can’t scan QR code?
                </Button>
              </>
            )}

            {displayFormat == 'uri' && (
              <>
                <Text>Set up a new sign-in method in your authenticator and enter the Key provided below.</Text>

                <Text>Make sure Time-based or One-time passwords is enabled, then finish linking your account.</Text>

                <ClipboardInput value={totp.secret} />

                <Text>Alternatively, if your authenticator supports TOTP URIs, you can also copy the full URI.</Text>

                <ClipboardInput value={totp.uri} />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('qr')}
                >
                  Scan QR code instead
                </Button>
              </>
            )}
          </Col>

          <FormButtonContainer sx={{ marginTop: 0 }}>
            <Button
              textVariant='buttonExtraSmallBold'
              onClick={onContinue}
            >
              Continue
            </Button>

            <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
          </FormButtonContainer>
        </>
      )}
    </ContentPage.Root>
  );
};
