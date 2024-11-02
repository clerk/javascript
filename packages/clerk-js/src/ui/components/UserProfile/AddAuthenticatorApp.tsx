import { isClerkRuntimeError } from '@clerk/shared/error';
import { __experimental_useReverification as useReverification, useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { QRCode } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, descriptors, Flex, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  ClipboardInput,
  FormButtonContainer,
  FormContainer,
  FullHeightLoader,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError } from '../../utils';

type AddAuthenticatorAppProps = FormProps & {
  title: LocalizationKey;
};

type DisplayFormat = 'qr' | 'uri';

export const AddAuthenticatorApp = withCardStateProvider((props: AddAuthenticatorAppProps) => {
  const { title, onSuccess, onReset } = props;
  const { user } = useUser();
  const card = useCardState();
  const [createTOTP] = useReverification(() => {
    if (!user) {
      return Promise.resolve(undefined);
    }
    return user.createTOTP();
  });
  const { close } = useActionContext();
  const [totp, setTOTP] = React.useState<TOTPResource | undefined>(undefined);
  const [displayFormat, setDisplayFormat] = React.useState<DisplayFormat>('qr');

  // TODO: React18
  // Non-idempotent useEffect
  React.useEffect(() => {
    if (!user) {
      return;
    }

    void createTOTP()
      .then(totp => setTOTP(totp))
      .catch(err => {
        if (isClerkRuntimeError(err) && err.code === 'reverification_cancelled') {
          return close();
        }
        return handleError(err, [], card.setError);
      });
  }, []);

  if (card.error) {
    return <FormContainer headerTitle={title} />;
  }

  return (
    <FormContainer
      headerTitle={title}
      headerSubtitle={
        displayFormat == 'qr'
          ? localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__ableToScan')
          : localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__unableToScan')
      }
    >
      {!totp && <FullHeightLoader />}

      {totp && (
        <>
          <Col gap={4}>
            {displayFormat == 'qr' && (
              <QRCode
                justify='center'
                url={totp.uri || ''}
              />
            )}

            {displayFormat == 'uri' && (
              <>
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan1',
                  )}
                />

                <ClipboardInput value={totp.secret} />

                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan2',
                  )}
                />

                <ClipboardInput value={totp.uri} />
              </>
            )}
          </Col>
          <Flex
            justify='between'
            align='center'
            sx={{ width: '100%' }}
          >
            {displayFormat == 'qr' && (
              <Button
                variant='link'
                textVariant='buttonLarge'
                onClick={() => setDisplayFormat('uri')}
                localizationKey={localizationKeys(
                  'userProfile.mfaTOTPPage.authenticatorApp.buttonUnableToScan__nonPrimary',
                )}
              />
            )}
            {displayFormat == 'uri' && (
              <Button
                variant='link'
                textVariant='buttonLarge'
                onClick={() => setDisplayFormat('qr')}
                localizationKey={localizationKeys(
                  'userProfile.mfaTOTPPage.authenticatorApp.buttonAbleToScan__nonPrimary',
                )}
              />
            )}
            <FormButtonContainer>
              <Button
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
          </Flex>
        </>
      )}
    </FormContainer>
  );
});
