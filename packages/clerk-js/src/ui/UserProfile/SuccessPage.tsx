import React from 'react';

import { LocalizationKey, localizationKeys, Text } from '../customizables';
import { FormButtonContainer } from './FormButtons';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

type SuccessPageProps = {
  title: LocalizationKey;
  text: LocalizationKey;
  backupCodes?: string[];
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title, backupCodes } = props;

  return (
    <ContentPage.Root headerTitle={title}>
      <Text
        localizationKey={text}
        variant='regularRegular'
      />

      {backupCodes && (
        <MfaBackupCodeList
          subtitle={
            'You can use one of these to sign in to your account, if you lose access to your authentication device.'
          }
          backupCodes={backupCodes}
        />
      )}

      <FormButtonContainer>
        <NavigateToFlowStartButton
          variant='solid'
          autoFocus
          localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
        />
      </FormButtonContainer>
    </ContentPage.Root>
  );
};
