import { useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/types';
import React from 'react';

import { QRCode } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, descriptors, localizationKeys, Text } from '../../customizables';
import { ClipboardInput, FormButtonContainer, FormContent, FullHeightLoader, useCardState } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type AddAuthenticatorAppProps = {
  title: LocalizationKey;
  onContinue: () => void;
};

type DisplayFormat = 'qr' | 'uri';

export const AddAuthenticatorApp = (props: AddAuthenticatorAppProps) => {
  const { title, onContinue } = props;
  const { user } = useUser();
  const { close } = useActionContext();
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
    return <FormContent headerTitle={title} />;
  }

  return (
    <FormContent
      headerTitle={title}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      {!totp && <FullHeightLoader />}

      {totp && (
        <>
          <Col gap={4}>
            {displayFormat == 'qr' && (
              <>
                <Text
                  localizationKey={localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__ableToScan')}
                />

                <QRCode url={totp.uri || ''} />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('uri')}
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.buttonUnableToScan__nonPrimary',
                  )}
                />
              </>
            )}

            {displayFormat == 'uri' && (
              <>
                <Text
                  localizationKey={localizationKeys('userProfile.mfaTOTPPage.authenticatorApp.infoText__unableToScan')}
                />

                <Text
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan1',
                  )}
                />

                <ClipboardInput value={totp.secret} />

                <Text
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.inputLabel__unableToScan2',
                  )}
                />

                <ClipboardInput value={totp.uri} />

                <Button
                  variant='link'
                  onClick={() => setDisplayFormat('qr')}
                  localizationKey={localizationKeys(
                    'userProfile.mfaTOTPPage.authenticatorApp.buttonAbleToScan__nonPrimary',
                  )}
                />
              </>
            )}
          </Col>

          <FormButtonContainer sx={{ marginTop: 0 }}>
            <Button
              textVariant='buttonSmall'
              onClick={onContinue}
              localizationKey={localizationKeys('userProfile.formButtonPrimary__continue')}
              elementDescriptor={descriptors.formButtonPrimary}
            />

            <Button
              variant='ghost'
              onClick={close}
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              elementDescriptor={descriptors.formButtonReset}
            />
          </FormButtonContainer>
        </>
      )}
    </FormContent>
  );
};
