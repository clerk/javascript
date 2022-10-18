import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import { Col, Text } from '../../customizables';
import { ArrowBlockButton, useCardState, withCardStateProvider } from '../../elements';
import { getFlagEmojiFromCountryIso, handleError, parsePhoneString, stringToFormattedPhoneString } from '../../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { AddPhone, VerifyPhone } from './PhonePage';
import { SuccessPage } from './SuccessPage';
import { AddBlockButton } from './UserProfileBlockButtons';
import { ContentPage } from './UserProfileContentPage';

export const MfaPhoneCodePage = withCardStateProvider(() => {
  const ref = React.useRef<PhoneNumberResource>();
  const wizard = useWizard({ defaultStep: 2 });

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
        backupCodes={ref.current?.backupCodes}
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
  const user = useCoreUser();
  const availableMethods = user.phoneNumbers.filter(p => !p.reservedForSecondFactor);

  const enableMfa = (phone: PhoneNumberResource) => {
    if (phone.verification.status !== 'verified') {
      return onUnverifiedPhoneClick(phone);
    }

    card.setLoading(phone.id);
    phone
      .setReservedForSecondFactor({ reserved: true })
      .then(() => {
        card.setIdle();
        onSuccess();
      })
      .catch(err => handleError(err, [], card.setError));

    resourceRef.current = phone;
  };

  return (
    <ContentPage headerTitle={title}>
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
          const flag = getFlagEmojiFromCountryIso(parsePhoneString(phone.phoneNumber).iso);

          return (
            <ArrowBlockButton
              // elementDescriptor={descriptors.socialButtonsButtonBlock}
              // elementId={descriptors.socialButtonsButtonBlock.setId(strategy)}
              // textElementDescriptor={descriptors.socialButtonsButtonBlockText}
              // textElementId={descriptors.socialButtonsButtonBlockText.setId(strategy)}
              // arrowElementDescriptor={descriptors.socialButtonsButtonBlockArrow}
              // arrowElementId={descriptors.socialButtonsButtonBlockArrow.setId(strategy)}
              key={phone.id}
              // id={strategyToDisplayData[strategy].id}
              onClick={() => enableMfa(phone)}
              isLoading={card.loadingMetadata === phone.id}
              isDisabled={card.isLoading}
              icon={
                <Text
                  as='span'
                  sx={theme => ({ fontSize: theme.fontSizes.$sm })}
                >
                  {flag}
                </Text>
              }
            >
              {formattedPhone}
            </ArrowBlockButton>
          );
        })}
        <AddBlockButton
          block={false}
          onClick={onAddPhoneClick}
          textLocalizationKey={localizationKeys('userProfile.mfaPhoneCodePage.primaryButton__addPhoneNumber')}
        />
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton localizationKey={localizationKeys('userProfile.formButtonReset')} />
      </FormButtonContainer>
    </ContentPage>
  );
};
