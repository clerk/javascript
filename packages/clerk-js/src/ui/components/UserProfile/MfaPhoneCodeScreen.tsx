import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { FormButtonContainer, FormContainer, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { handleError, stringToFormattedPhoneString } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone, VerifyPhone } from './PhoneForm';

type MfaPhoneCodeScreenProps = FormProps;
export const MfaPhoneCodeScreen = withCardStateProvider((props: MfaPhoneCodeScreenProps) => {
  const { onReset } = props;
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />
      <VerifyPhone
        title={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onReset={wizard.prevStep}
      />
      <AddMfa
        onSuccess={wizard.nextStep}
        onReset={onReset}
        onAddPhoneClick={() => wizard.goToStep(0)}
        onUnverifiedPhoneClick={phone => {
          ref.current = phone;
          wizard.goToStep(1);
        }}
        title={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.title')}
        resourceRef={ref}
      />
      <SuccessPage
        title={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.title')}
        text={localizationKeys('userProfile.security.mfaSection.mfaPhoneCodeScreen.successMessage')}
        onFinish={onReset}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.security.mfaSection.backupCodeScreen.successSubtitle')}
            backupCodes={ref.current?.backupCodes}
          />
        }
      />
    </Wizard>
  );
});

type AddMfaProps = FormProps & {
  onAddPhoneClick: React.MouseEventHandler;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

const AddMfa = (props: AddMfaProps) => {
  const { onSuccess, onReset, title, onAddPhoneClick, onUnverifiedPhoneClick, resourceRef } = props;
  const card = useCardState();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const availableMethods = user.phoneNumbers.filter(p => !p.reservedForSecondFactor);

  const enableMfa = async (phone: PhoneNumberResource) => {
    if (phone.verification.status !== 'verified') {
      return onUnverifiedPhoneClick(phone);
    }

    card.setLoading(phone.id);
    try {
      await phone.setReservedForSecondFactor({ reserved: true }).then(() => {
        resourceRef.current = phone;
        onSuccess();
      });
    } catch (err) {
      handleError(err, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <FormContainer headerTitle={title}>
      <Text
        localizationKey={localizationKeys(
          availableMethods.length
            ? 'userProfile.security.mfaSection.mfaPhoneCodeScreen.subtitle__availablePhoneNumbers'
            : 'userProfile.security.mfaSection.mfaPhoneCodeScreen.subtitle__unavailablePhoneNumbers',
        )}
      />
      <Col gap={2}>
        {availableMethods.map(phone => {
          const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

          return (
            <Button
              key={phone.id}
              variant='ghost'
              sx={{ justifyContent: 'start' }}
              onClick={() => enableMfa(phone)}
              isLoading={card.loadingMetadata === phone.id}
              isDisabled={card.isLoading}
            >
              {formattedPhone}
            </Button>
          );
        })}
        <Button
          variant='ghost'
          sx={{ justifyContent: 'start' }}
          onClick={onAddPhoneClick}
          localizationKey={localizationKeys(
            'userProfile.security.mfaSection.mfaPhoneCodeScreen.primaryButton__addPhoneNumber',
          )}
        />
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          onClick={onReset}
        />
      </FormButtonContainer>
    </FormContainer>
  );
};
