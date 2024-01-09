import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { FormContainer, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { Plus } from '../../icons';
import { getCountryFromPhoneString, handleError, stringToFormattedPhoneString } from '../../utils';
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
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
      />
      <SuccessPage
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        text={localizationKeys('userProfile.mfaPhoneCodePage.successMessage')}
        onFinish={onReset}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.successSubtitle')}
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
        sx={t => ({ color: t.colors.$blackAlpha500 })}
      />
      <Col gap={2}>
        {availableMethods.map(phone => {
          const { country } = getCountryFromPhoneString(phone.phoneNumber);

          const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);

          return (
            <Button
              key={phone.id}
              variant='secondary'
              onClick={() => enableMfa(phone)}
              isLoading={card.loadingMetadata === phone.id}
              isDisabled={card.isLoading}
              sx={t => ({
                columnGap: t.space.$2x5,
                justifyContent: 'start',
              })}
            >
              <span>{country.iso.toUpperCase()}</span> <span>{formattedPhone}</span>
            </Button>
          );
        })}

        <Flex sx={{ justifyContent: 'space-between' }}>
          <Button
            variant='ghost'
            sx={{ justifyContent: 'start' }}
            onClick={onAddPhoneClick}
            localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.primaryButton__addPhoneNumber')}
            icon={Plus}
          />

          <Button
            variant='ghost'
            localizationKey={localizationKeys('userProfile.formButtonReset')}
            onClick={onReset}
          />
        </Flex>
      </Col>
    </FormContainer>
  );
};
