import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, localizationKeys, Text } from '../../customizables';
import { FormButtonContainer, FormContent, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError, stringToFormattedPhoneString } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone, VerifyPhone } from './PhoneForm';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const MfaPhoneCodeScreen = withCardStateProvider(() => {
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });
  const { close } = useActionContext();

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
      />
      <VerifyPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
      />
      <AddMfa
        onSuccess={wizard.nextStep}
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
        onFinish={close}
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

type AddMfaProps = {
  onAddPhoneClick: React.MouseEventHandler;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  onSuccess: () => void;
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

const AddMfa = (props: AddMfaProps) => {
  const { onSuccess, title, onAddPhoneClick, onUnverifiedPhoneClick, resourceRef } = props;
  const card = useCardState();
  const { user } = useUser();
  const { close } = useActionContext();

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
    <FormContent
      headerTitle={title}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Text
        localizationKey={localizationKeys(
          availableMethods.length
            ? 'userProfile.mfaPhoneCodePage.subtitle__availablePhoneNumbers'
            : 'userProfile.mfaPhoneCodePage.subtitle__unavailablePhoneNumbers',
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
          localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.primaryButton__addPhoneNumber')}
        />
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          onClick={close}
        />
      </FormButtonContainer>
    </FormContent>
  );
};
