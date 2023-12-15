import type { PropsWithChildren } from 'react';

import { descriptors, Flex, Spinner } from '../customizables';
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
    <Card.Root>
      <Card.Content>
        <Card.Alert>{card.error}</Card.Alert>
        <LoadingCardContainer />
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});
