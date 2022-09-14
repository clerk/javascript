import React from 'react';

import { LocalizationKey, localizationKeys, Text } from '../customizables';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

type SuccessPageProps = {
  title: LocalizationKey;
  text: LocalizationKey;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title } = props;

  return (
    <ContentPage.Root headerTitle={title}>
      <Text
        localizationKey={text}
        variant='regularRegular'
      />
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
