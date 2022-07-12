import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useWizard, Wizard } from '../common';
import { Col, Text } from '../customizables';
import { ArrowBlockButton, useCardState, withCardStateProvider } from '../elements';
import { getFlagEmojiFromCountryIso, handleError, parsePhoneString, stringToFormattedPhoneString } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';
import { AddPhone, VerifyPhone } from './PhonePage';
import { SuccessPage } from './SuccessPage';
import { AddBlockButton } from './UserProfileBlockButtons';

export const MfaPage = withCardStateProvider(() => {
  const title = 'Add multifactor authentication';

  const ref = React.useRef<PhoneNumberResource | undefined>();
  const wizard = useWizard({ defaultStep: 2 });

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        title={title}
        resourceRef={ref}
        onSuccess={wizard.nextStep}
      />
      <VerifyPhone
        title={title}
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
        title={title}
      />
      <SuccessPage
        title={title}
        text={`SMS code multifactor authentication is now enabled for this phone number. When signing in, you will need to enter a verification code sent to this phone number as an additional step.`}
      />
    </Wizard>
  );
});

type AddMfaProps = {
  onAddPhoneClick: React.MouseEventHandler;
  onUnverifiedPhoneClick: (phone: PhoneNumberResource) => void;
  onSuccess: () => void;
  title: string;
};

const AddMfa = (props: AddMfaProps) => {
  const { onSuccess, title, onAddPhoneClick, onUnverifiedPhoneClick } = props;
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
  };

  return (
    <ContentPage.Root headerTitle={title}>
      <Text>
        {availableMethods.length
          ? 'Select a phone number to register for SMS code multifactor authentication.'
          : 'There are no available methods.'}
      </Text>
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
        >
          Add a phone number
        </AddBlockButton>
      </Col>
      <FormButtonContainer sx={{ marginTop: 0 }}>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
