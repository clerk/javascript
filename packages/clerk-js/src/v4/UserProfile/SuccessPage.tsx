import React from 'react';

import { Text } from '../customizables';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';
import { ContentPage } from './Page';

type SuccessPageProps = {
  title: string;
  text: string;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title } = props;

  return (
    <ContentPage.Root headerTitle={title}>
      <Text variant='regularRegular'>{text}</Text>
      <ContentPage.Toolbar>
        <NavigateToFlowStartButton
          variant='solid'
          autoFocus
        >
          Finish
        </NavigateToFlowStartButton>
      </ContentPage.Toolbar>
    </ContentPage.Root>
  );
};
