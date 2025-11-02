import { useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/shared/types';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { IconButton } from '@/ui/elements/IconButton';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { handleError } from '@/ui/utils/errorHandler';
import { getCountryFromPhoneString, stringToFormattedPhoneString } from '@/ui/utils/phoneUtils';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, Icon, localizationKeys, Text } from '../../customizables';
import { Plus } from '../../icons';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone } from './PhoneForm';
import { VerifyWithCode } from './VerifyWithCode';

type MfaPhoneCodeScreenProps = FormProps;
export const MfaPhoneCodeScreen = withCardStateProvider((props: MfaPhoneCodeScreenProps) => {
  const { onReset, onSuccess } = props;
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

  const isInstanceWithBackupCodes = useEnvironment().userSettings.attributes.backup_code?.enabled;

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onUseExistingNumberClick={() => wizard.goToStep(2)}
        onReset={onReset}
      />
      <MFAVerifyPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={() => (isInstanceWithBackupCodes ? wizard.goToStep(3) : onSuccess())}
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
          text={
            ref.current?.backupCodes && ref.current?.backupCodes.length > 0
              ? [
                  localizationKeys('userProfile.mfaPhoneCodePage.successMessage1'),
                  localizationKeys('userProfile.mfaPhoneCodePage.successMessage2'),
                ]
              : [localizationKeys('userProfile.mfaPhoneCodePage.successMessage1')]
          }
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

const EnableMFAButtonForPhone = (
  props: {
    phone: PhoneNumberResource;
  } & Pick<AddMfaProps, 'onUnverifiedPhoneClick' | 'resourceRef' | 'onSuccess'>,
) => {
  const { phone, onSuccess, onUnverifiedPhoneClick, resourceRef } = props;
  const card = useCardState();
  const setReservedForSecondFactor = useReverification(() => phone.setReservedForSecondFactor({ reserved: true }));

  const { country } = getCountryFromPhoneString(phone.phoneNumber);
  const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

  const enableMfa = async () => {
    if (phone.verification.status !== 'verified') {
      return onUnverifiedPhoneClick(phone);
    }

    card.setLoading(phone.id);
    try {
      await setReservedForSecondFactor();
      resourceRef.current = phone;
      onSuccess();
    } catch (err: any) {
      handleError(err, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Button
      key={phone.id}
      variant='outline'
      colorScheme='neutral'
      sx={{ justifyContent: 'start' }}
      onClick={enableMfa}
      isLoading={card.loadingMetadata === phone.id}
      isDisabled={card.isLoading}
    >
      {country.iso.toUpperCase()} {formattedPhone}
    </Button>
  );
};

type MFAVerifyPhoneProps = FormProps & {
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

export const MFAVerifyPhone = (props: MFAVerifyPhoneProps) => {
  const { title, onSuccess, resourceRef, onReset } = props;
  const card = useCardState();
  const phone = resourceRef.current;
  const setReservedForSecondFactor = useReverification(() => phone?.setReservedForSecondFactor({ reserved: true }));

  const enableMfa = async () => {
    card.setLoading(phone?.id);
    try {
      await setReservedForSecondFactor();
      resourceRef.current = phone;
      onSuccess();
    } catch (err: any) {
      handleError(err, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <FormContainer
      headerTitle={title}
      headerSubtitle={localizationKeys('userProfile.phoneNumberPage.verifySubtitle', {
        identifier: resourceRef.current?.phoneNumber || '',
      })}
    >
      <VerifyWithCode
        nextStep={() => {
          void enableMfa();
        }}
        identification={resourceRef.current}
        identifier={resourceRef.current?.phoneNumber}
        prepareVerification={resourceRef.current?.prepareVerification}
        onReset={onReset}
      />
    </FormContainer>
  );
};

const AddMfa = (props: AddMfaProps) => {
  const { onSuccess, onReset, title, onAddPhoneClick, onUnverifiedPhoneClick, resourceRef } = props;
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const availableMethods = user.phoneNumbers.filter(p => !p.reservedForSecondFactor);

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
          {availableMethods.map(phone => (
            <EnableMFAButtonForPhone
              key={phone.id}
              {...{ onSuccess, phone, onUnverifiedPhoneClick, resourceRef }}
            />
          ))}
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
