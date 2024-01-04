import { useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { QRCode } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, descriptors, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  ClipboardInput,
  FormButtonContainer,
  FormContainer,
  FullHeightLoader,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { handleError } from '../../utils';

type AddAuthenticatorAppProps = FormProps & {
  title: LocalizationKey;
};

type DisplayFormat = 'qr' | 'uri';

export const AddAuthenticatorApp = withCardStateProvider((props: AddAuthenticatorAppProps) => {
  const { title, onSuccess, onReset } = props;
  const { user } = useUser();
  const card = useCardState();
  const [totp, setTOTP] = React.useState<TOTPResource | undefined>(undefined);
  const [displayFormat, setDisplayFormat] = React.useState<DisplayFormat>('qr');

  // TODO: React18
  // Non-idempotent useEffect
  React.useEffect(() => {
    void user
      ?.createTOTP()
      .then((totp: TOTPResource) => setTOTP(totp))
      .catch(err => handleError(err, [], card.setError));
  }, []);

  if (card.error) {
    return <FormContainer headerTitle={title} />;
  }

  return (
    <FormContainer headerTitle={title}>
      {!totp && <FullHeightLoader />}

      {totp && (
        <>
          <Col gap={4}>
            {displayFormat == 'qr' && (
              <>
                <Text
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.infoText__ableToScan',
                  )}
                />

                <QRCode url={totp.uri || ''} />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('uri')}
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.buttonUnableToScan__nonPrimary',
                  )}
                />
              </>
            )}

            {displayFormat == 'uri' && (
              <>
                <Text
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.infoText__unableToScan',
                  )}
                />

                <Text
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.inputLabel__unableToScan1',
                  )}
                />

                <ClipboardInput value={totp.secret} />

                <Text
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.inputLabel__unableToScan2',
                  )}
                />

                <ClipboardInput value={totp.uri} />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('qr')}
                  localizationKey={localizationKeys(
                    'userProfile.security.mfaSection.mfaTOTPScreen.authenticatorApp.buttonAbleToScan__nonPrimary',
                  )}
                />
              </>
            )}
          </Col>

          <FormButtonContainer sx={{ marginTop: 0 }}>
            <Button
              textVariant='buttonSmall'
              onClick={onSuccess}
              localizationKey={localizationKeys('userProfile.formButtonPrimary__continue')}
              elementDescriptor={descriptors.formButtonPrimary}
            />

            <Button
              variant='ghost'
              onClick={onReset}
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              elementDescriptor={descriptors.formButtonReset}
            />
          </FormButtonContainer>
        </>
      )}
    </FormContainer>
  );
});
