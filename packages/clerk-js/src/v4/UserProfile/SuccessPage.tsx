import React from 'react';

import { useNavigate } from '../../ui/hooks';
import { Button, Text } from '../customizables';
import { ContentPage } from './Page';

type SuccessPageProps = {
  title: string;
  text: string;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title } = props;
  const { navigate } = useNavigate();

  return (
    <ContentPage.Root headerTitle={title}>
      <Text variant='regularRegular'>{text}</Text>
      <ContentPage.Toolbar>
        <Button
          autoFocus
          textVariant='buttonSmall'
          onClick={() => navigate('../')}
        >
          Finish
        </Button>
      </ContentPage.Toolbar>
    </ContentPage.Root>
  );
};
