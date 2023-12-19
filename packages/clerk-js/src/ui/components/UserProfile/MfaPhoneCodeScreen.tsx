import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { FormButtonContainer, FormContent, useCardState, withCardStateProvider } from '../../elements';
import { handleError, stringToFormattedPhoneString } from '../../utils';
import { AddPhone, VerifyPhone } from './PhoneForm';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

type MfaPhoneCodeScreenProps = FormProps;
export const MfaPhoneCodeScreen = withCardStateProvider((props: MfaPhoneCodeScreenProps) => {
  const { onSuccess, onReset } = props;
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />
      <VerifyPhone
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
        onReset={wizard.prevStep}
      />
      <AddMfa
        onSuccess={onSuccess}
        onReset={onReset}
        onAddPhoneClick={() => wizard.goToStep(0)}
        onUnverifiedPhoneClick={phone => {
          ref.current = phone;
          wizard.goToStep(1);
        }}
        title={localizationKeys('userProfile.mfaPhoneCodePage.title')}
        resourceRef={ref}
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
          onClick={onReset}
        />
      </FormButtonContainer>
    </FormContent>
  );
};
