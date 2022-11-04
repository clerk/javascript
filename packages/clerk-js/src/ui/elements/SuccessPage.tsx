import React from 'react';

import { Text } from '../customizables';
import { ContentPage, FormButtonContainer, NavigateToFlowStartButton } from '../elements';
import { LocalizationKey, localizationKeys } from '../localization';
import { PropsOfComponent } from '../styledSystem';

type SuccessPageProps = Omit<PropsOfComponent<typeof ContentPage>, 'headerTitle' | 'title'> & {
  title: LocalizationKey;
  text: LocalizationKey;
  finishLabel?: LocalizationKey;
  content?: React.ReactNode;
  onFinish?: () => void;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title, finishLabel, onFinish, content, ...rest } = props;

  return (
    <ContentPage
      headerTitle={title}
      {...rest}
    >
      <Text
        localizationKey={text}
        variant='regularRegular'
      />

      {content}

      <FormButtonContainer>
        <NavigateToFlowStartButton
          variant='solid'
          autoFocus
          //Do we need a separate key here?
          localizationKey={finishLabel || localizationKeys('userProfile.formButtonPrimary__finish')}
          {...(onFinish ? { onClick: onFinish } : {})}
        />
      </FormButtonContainer>
    </ContentPage>
  );
};
