import React from 'react';

import { descriptors, Flex } from '../customizables';
import { Spinner } from '../primitives';
import { CardAlert } from './Alert';
import { Card } from './Card';
import { useCardState, withCardStateProvider } from './contexts';

export const LoadingCard = withCardStateProvider(() => {
  const card = useCardState();
  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Flex
        direction='col'
        center
        elementDescriptor={descriptors.main}
        gap={8}
        sx={theme => ({
          marginTop: theme.space.$16,
          marginBottom: theme.space.$14,
        })}
      >
        <Spinner
          size='xl'
          colorScheme='primary'
        />
      </Flex>
    </Card>
  );
});
