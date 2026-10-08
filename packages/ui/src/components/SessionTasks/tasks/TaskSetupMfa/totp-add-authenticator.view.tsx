import { QRCode } from '@/common';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { FullHeightLoader } from '@/elements/FullHeightLoader';
import { Checkmark, Clipboard } from '@/icons';
import { Button, Col, descriptors, localizationKeys, Text } from '@/ui/customizables';

import type { useTotpAddAuthenticatorController } from './totp-add-authenticator.controller';

export const TotpAddAuthenticatorView = ({
  controller,
}: {
  controller: ReturnType<typeof useTotpAddAuthenticatorController>;
}) => (
  <FormContainer
    headerTitle={localizationKeys('taskSetupMfa.totpCode.title')}
    headerTitleTextVariant='h2'
    headerSubtitle={
      controller.displayFormat === 'qr'
        ? localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.infoText__ableToScan')
        : localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.infoText__unableToScan')
    }
    badgeText={localizationKeys('taskSetupMfa.badge')}
  >
    {!controller.totp && <FullHeightLoader />}

    {controller.totp && (
      <>
        <Col gap={4}>
          {controller.displayFormat === 'qr' && (
            <QRCode
              justify='center'
              url={controller.totp.uri || ''}
            />
          )}

          {controller.displayFormat === 'uri' && (
            <>
              <Text
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'taskSetupMfa.totpCode.addAuthenticatorApp.inputLabel__unableToScan1',
                )}
              />
              <ClipboardInput
                value={controller.totp.secret}
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </>
          )}
        </Col>
        <Col sx={theme => ({ gap: theme.space.$8 })}>
          {controller.displayFormat === 'qr' && (
            <Button
              variant='outline'
              textVariant='buttonLarge'
              onClick={controller.showURI}
              localizationKey={localizationKeys(
                'taskSetupMfa.totpCode.addAuthenticatorApp.buttonUnableToScan__nonPrimary',
              )}
            />
          )}
          {controller.displayFormat === 'uri' && (
            <Button
              variant='outline'
              block
              textVariant='buttonLarge'
              onClick={controller.showQR}
              localizationKey={localizationKeys(
                'taskSetupMfa.totpCode.addAuthenticatorApp.buttonAbleToScan__nonPrimary',
              )}
            />
          )}
          <FormButtonContainer
            sx={theme => ({
              flexDirection: 'column',
              gap: theme.space.$4,
            })}
          >
            <Button
              block
              onClick={controller.onSuccess}
              hasArrow
              localizationKey={localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.formButtonPrimary')}
              elementDescriptor={descriptors.formButtonPrimary}
            />
            <Button
              block
              variant='ghost'
              onClick={controller.onReset}
              localizationKey={localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.formButtonReset')}
              elementDescriptor={descriptors.formButtonReset}
            />
          </FormButtonContainer>
        </Col>
      </>
    )}
  </FormContainer>
);
