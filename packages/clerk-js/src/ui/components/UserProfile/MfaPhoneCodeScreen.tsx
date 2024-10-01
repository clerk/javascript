import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, Icon, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  FormButtonContainer,
  FormContainer,
  IconButton,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useAssurance } from '../../hooks/useAssurance';
import { Plus } from '../../icons';
import { getCountryFromPhoneString, handleError, stringToFormattedPhoneString } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone, VerifyPhone } from './PhoneForm';

type MfaPhoneCodeScreenProps = FormProps;
export const MfaPhoneCodeScreen = withCardStateProvider((props: MfaPhoneCodeScreenProps) => {
  const { onReset, onSuccess } = props;
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

  const isInstanceWithBackupCodes = useEnvironment().userSettings.attributes.backup_code.enabled;

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onUseExistingNumberClick={() => wizard.goToStep(2)}
        onReset={onReset}
      />
      <VerifyPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onReset={() => wizard.goToStep(2)}
      />
      <AddMfa
        onSuccess={isInstanceWithBackupCodes ? wizard.nextStep : onSuccess}
        onReset={onReset}
        onAddPhoneClick={() => wizard.goToStep(0)}
        onUnverifiedPhoneClick={phone => {
          ref.current = phone;
          wizard.goToStep(1);
        }}
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
      />
      {isInstanceWithBackupCodes && (
        <SuccessPage
          title={localizationKeys('userProfile.mfaPhoneCodePage.successTitle')}
          text={[
            localizationKeys('userProfile.mfaPhoneCodePage.successMessage1'),
            localizationKeys('userProfile.mfaPhoneCodePage.successMessage2'),
          ]}
          onFinish={onReset}
          contents={<MfaBackupCodeList backupCodes={ref.current?.backupCodes} />}
        />
      )}
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
  const { handleAssurance } = useAssurance();

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
      await handleAssurance(() => phone.setReservedForSecondFactor({ reserved: true }));
      resourceRef.current = phone;
      onSuccess();
    } catch (err) {
      handleError(err, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <FormContainer
      headerTitle={title}
      gap={1}
    >
      <Text
        localizationKey={localizationKeys(
          availableMethods.length
            ? 'userProfile.mfaPhoneCodePage.subtitle__availablePhoneNumbers'
            : 'userProfile.mfaPhoneCodePage.subtitle__unavailablePhoneNumbers',
        )}
        colorScheme='secondary'
      />
      {availableMethods.length > 0 && (
        <Col gap={2}>
          {availableMethods.map(phone => {
            const { country } = getCountryFromPhoneString(phone.phoneNumber);

            const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

            return (
              <Button
                key={phone.id}
                variant='outline'
                colorScheme='neutral'
                sx={{ justifyContent: 'start' }}
                onClick={() => enableMfa(phone)}
                isLoading={card.loadingMetadata === phone.id}
                isDisabled={card.isLoading}
              >
                {country.iso.toUpperCase()} {formattedPhone}
              </Button>
            );
          })}
        </Col>
      )}
      <FormButtonContainer sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton
          variant='ghost'
          aria-label='Add phone number'
          icon={
            <Icon
              icon={Plus}
              sx={t => ({ marginRight: t.space.$2 })}
            />
          }
          localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.primaryButton__addPhoneNumber')}
          onClick={onAddPhoneClick}
        />
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          onClick={onReset}
        />
      </FormButtonContainer>
    </FormContainer>
  );
};
