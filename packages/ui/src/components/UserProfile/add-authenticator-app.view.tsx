import { QRCode } from '@/ui/common';
import { Button, Col, descriptors, Flex, localizationKeys, Text } from '@/ui/customizables';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';

import type { useAddAuthenticatorAppController } from './add-authenticator-app.controller';

export const AddAuthenticatorAppView = ({
  controller,
}: {
  controller: ReturnType<typeof useAddAuthenticatorAppController>;
}) => {
  if (controller.hasError) {
    return <FormContainer headerTitle={controller.title} />;
  }

  return (
    <FormContainer
      headerTitle={controller.title}
      headerSubtitle={
        controller.displayFormat == 'qr'
          ? localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__ableToScan')
          : localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__unableToScan')
      }
    >
      {!controller.totp && <FullHeightLoader />}

      {controller.totp && (
        <>
          <Col gap={4}>
            {controller.displayFormat == 'qr' && (
              <QRCode
                justify='center'
                url={controller.totp.uri || ''}
              />
            )}

            {controller.displayFormat == 'uri' && (
              <>
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan1',
                  )}
                />

                <ClipboardInput value={controller.totp.secret} />

                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan2',
                  )}
                />

                <ClipboardInput value={controller.totp.uri} />
              </>
            )}
          </Col>
          <Flex
            justify='between'
            align='center'
            sx={{ width: '100%' }}
          >
            {controller.displayFormat == 'qr' && (
              <Button
                variant='link'
                textVariant='buttonLarge'
                onClick={controller.showURI}
                localizationKey={localizationKeys(
                  'userProfile.mfaTOTPPage.authenticatorApp.buttonUnableToScan__nonPrimary',
                )}
              />
            )}
            {controller.displayFormat == 'uri' && (
              <Button
                variant='link'
                textVariant='buttonLarge'
                onClick={controller.showQR}
                localizationKey={localizationKeys(
                  'userProfile.mfaTOTPPage.authenticatorApp.buttonAbleToScan__nonPrimary',
                )}
              />
            )}
            <FormButtonContainer>
              <Button
                onClick={controller.onSuccess}
                localizationKey={localizationKeys('userProfile.formButtonPrimary__continue')}
                elementDescriptor={descriptors.formButtonPrimary}
              />

              <Button
                variant='ghost'
                onClick={controller.onReset}
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                elementDescriptor={descriptors.formButtonReset}
              />
            </FormButtonContainer>
          </Flex>
        </>
      )}
    </FormContainer>
  );
};
