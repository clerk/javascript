import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Col, localizationKeys, Text } from '../../customizables';
import {
  ArrowBlockButton,
  FormButtonContainer,
  FormContent,
  NavigateToFlowStartButton,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { getFlagEmojiFromCountryIso, handleError, parsePhoneString, stringToFormattedPhoneString } from '../../utils';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { AddPhone, VerifyPhone } from './PhoneForm';
import { AddBlockButton } from './UserProfileBlockButtons';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

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
              leftIcon={
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
    </FormContent>
  );
};
