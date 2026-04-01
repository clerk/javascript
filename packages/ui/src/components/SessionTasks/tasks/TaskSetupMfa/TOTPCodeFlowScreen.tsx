import { isClerkRuntimeError } from '@clerk/shared/error';
import { useReverification, useUser } from '@clerk/shared/react';
import type { TOTPResource } from '@clerk/shared/types';
import React, { useRef } from 'react';

import { QRCode, useWizard, Wizard } from '@/common';
import { MfaBackupCodeList } from '@/components/UserProfile/MfaBackupCodeList';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { FullHeightLoader } from '@/elements/FullHeightLoader';
import { Check, ClipboardOutline } from '@/icons';
import { Button, Col, descriptors, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { handleError } from '@/utils/errorHandler';

import { SharedFooterActionForSignOut } from './shared';

type SuccessScreenProps = {
  resourceRef: React.MutableRefObject<TOTPResource | undefined>;
  onFinish: () => void;
};

type VerifyTOTPProps = {
  onSuccess: () => void;
  onReset: () => void;
  resourceRef: React.MutableRefObject<TOTPResource | undefined>;
};

type AddAuthenticatorAppProps = {
  onSuccess: () => void;
  onReset: () => void;
};

type DisplayFormat = 'qr' | 'uri';

export const AddAuthenticatorApp = withCardStateProvider((props: AddAuthenticatorAppProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();
  const card = useCardState();
  const createTOTP = useReverification(() => user?.createTOTP());
  const [totp, setTOTP] = React.useState<TOTPResource | undefined>(undefined);
  const [displayFormat, setDisplayFormat] = React.useState<DisplayFormat>('qr');

  React.useEffect(() => {
    if (!user) {
      return;
    }

    void createTOTP()
      .then(totp => setTOTP(totp))
      .catch(err => {
        if (isClerkRuntimeError(err) && err.code === 'reverification_cancelled') {
          return onReset();
        }
        return handleError(err, [], card.setError);
      });
  }, []);

  return (
    <FormContainer
      headerTitle={localizationKeys('taskSetupMfa.totpCode.title')}
      headerTitleTextVariant='h2'
      headerSubtitle={
        displayFormat === 'qr'
          ? localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.infoText__ableToScan')
          : localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.infoText__unableToScan')
      }
      badgeText={localizationKeys('taskSetupMfa.badge')}
    >
      {!totp && <FullHeightLoader />}

      {totp && (
        <>
          <Col gap={4}>
            {displayFormat === 'qr' && (
              <QRCode
                justify='center'
                url={totp.uri || ''}
              />
            )}

            {displayFormat === 'uri' && (
              <>
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'taskSetupMfa.totpCode.addAuthenticatorApp.inputLabel__unableToScan1',
                  )}
                />

                <ClipboardInput
                  value={totp.secret}
                  copyIcon={ClipboardOutline}
                  copiedIcon={Check}
                />
              </>
            )}
          </Col>
          <Col
            sx={theme => ({
              gap: theme.space.$8,
            })}
          >
            {displayFormat === 'qr' && (
              <Button
                variant='outline'
                textVariant='buttonLarge'
                onClick={() => setDisplayFormat('uri')}
                localizationKey={localizationKeys(
                  'taskSetupMfa.totpCode.addAuthenticatorApp.buttonUnableToScan__nonPrimary',
                )}
              />
            )}
            {displayFormat === 'uri' && (
              <Button
                variant='outline'
                block
                textVariant='buttonLarge'
                onClick={() => setDisplayFormat('qr')}
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
                onClick={onSuccess}
                hasArrow
                localizationKey={localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.formButtonPrimary')}
                elementDescriptor={descriptors.formButtonPrimary}
              />

              <Button
                block
                variant='ghost'
                onClick={onReset}
                localizationKey={localizationKeys('taskSetupMfa.totpCode.addAuthenticatorApp.formButtonReset')}
                elementDescriptor={descriptors.formButtonReset}
              />
            </FormButtonContainer>
          </Col>
        </>
      )}
    </FormContainer>
  );
});

export const VerifyTOTP = withCardStateProvider((props: VerifyTOTPProps) => {
  const { onSuccess, onReset, resourceRef } = props;
  const { user } = useUser();

  const otp = useFieldOTP<TOTPResource>({
    onCodeEntryFinished: (code, resolve, reject) => {
      user
        ?.verifyTOTP({ code })
        .then((totp: TOTPResource) => resolve(totp))
        .catch(reject);
    },
    onResolve: a => {
      resourceRef.current = a;
      onSuccess();
    },
  });

  return (
    <FormContainer
      headerTitle={localizationKeys('taskSetupMfa.totpCode.verifyTotp.title')}
      headerTitleTextVariant='h2'
      headerSubtitle={localizationKeys('taskSetupMfa.totpCode.verifyTotp.subtitle')}
      badgeText={localizationKeys('taskSetupMfa.badge')}
    >
      <Col>
        <Form.OTPInput
          {...otp}
          label={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formTitle')}
          description={localizationKeys('taskSetupMfa.totpCode.verifyTotp.subtitle')}
        />
      </Col>

      <FormButtonContainer
        sx={theme => ({
          flexDirection: 'column',
          gap: theme.space.$4,
        })}
      >
        <Button
          onClick={() => otp.onFakeContinue()}
          isDisabled={otp.isLoading}
          hasArrow
          block
          localizationKey={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formButtonPrimary')}
          elementDescriptor={descriptors.formButtonPrimary}
        />
        <Button
          onClick={() => onReset?.()}
          variant='ghost'
          block
          isDisabled={otp.isLoading}
          localizationKey={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
        />
      </FormButtonContainer>
    </FormContainer>
  );
});

const SuccessScreen = withCardStateProvider((props: SuccessScreenProps) => {
  const { resourceRef, onFinish } = props;

  return (
    <SuccessPage
      title={localizationKeys('taskSetupMfa.totpCode.success.title')}
      subtitle={localizationKeys('taskSetupMfa.totpCode.success.message1')}
      headerBadgeText={localizationKeys('taskSetupMfa.badge')}
      onFinish={onFinish}
      contents={
        <MfaBackupCodeList
          backupCodes={resourceRef.current?.backupCodes}
          subtitle={localizationKeys('taskSetupMfa.totpCode.success.message2')}
        />
      }
      finishLabel={localizationKeys('taskSetupMfa.totpCode.success.finishButton')}
      finishButtonProps={{
        block: true,
        hasArrow: true,
      }}
    />
  );
});

type TOTPCodeFlowProps = {
  onSuccess: () => void;
  goToStartStep: () => void;
};

export const TOTPCodeFlow = withCardStateProvider((props: TOTPCodeFlowProps) => {
  const { onSuccess, goToStartStep } = props;

  const ref = useRef<TOTPResource>();
  const wizard = useWizard({ defaultStep: 0 });

  return (
    <Card.Root>
      <Card.Content>
        <Wizard
          {...wizard.props}
          animate={false}
        >
          {/* Step 0: Add new authenticator app (default if no available authenticator apps) */}
          <AddAuthenticatorApp
            onSuccess={() => wizard.goToStep(1)}
            onReset={goToStartStep}
          />
          {/* Step 1: Verify TOTP */}
          <VerifyTOTP
            onSuccess={() => wizard.goToStep(2)}
            onReset={() => wizard.goToStep(0)}
            resourceRef={ref}
          />
          {/* Step 2: Success with backup codes */}
          <SuccessScreen
            resourceRef={ref}
            onFinish={onSuccess}
          />
        </Wizard>
      </Card.Content>
      <Card.Footer>
        <SharedFooterActionForSignOut />
      </Card.Footer>
    </Card.Root>
  );
});
