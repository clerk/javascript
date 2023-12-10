import type { PropsWithChildren } from 'react';

import { descriptors, Flex, Spinner } from '../customizables';
import { CardAlert } from './Alert';
import { Card } from './Card';
import { useCardState, withCardStateProvider } from './contexts';

export const LoadingCardContainer = ({ children }: PropsWithChildren) => {
  return (
    <Flex
      direction='col'
      center
      elementDescriptor={descriptors.main}
      gap={8}
      sx={theme => ({
        marginTop: theme.space.$16,
        marginBottom: theme.space.$13,
      })}
    >
      <Spinner
        size='xl'
        colorScheme='primary'
        elementDescriptor={descriptors.spinner}
      />
      {children}
    </Flex>
  );
};

export const LoadingCard = withCardStateProvider(() => {
  const card = useCardState();
  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <LoadingCardContainer />
    </Card>
  );
});
