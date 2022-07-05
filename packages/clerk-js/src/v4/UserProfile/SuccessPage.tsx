import React from 'react';

import { useRouter } from '../../ui/router';
import { Button, Text } from '../customizables';
import { ContentPage } from './Page';

type SuccessPageProps = {
  title: string;
  text: string;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title } = props;
  const router = useRouter();
  const navigateToUserProfile = () => {
    return router.navigate('/' + router.basePath + router.startPath);
  };

  return (
    <ContentPage.Root headerTitle={title}>
      <Text variant='regularRegular'>{text}</Text>
      <ContentPage.Toolbar>
        <Button
          autoFocus
          textVariant='buttonSmall'
          onClick={navigateToUserProfile}
        >
          Finish
        </Button>
      </ContentPage.Toolbar>
    </ContentPage.Root>
  );
};
