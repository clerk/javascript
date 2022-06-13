import React from 'react';

import { descriptors, Flex } from '../customizables';
import { Spinner } from '../primitives';
import { CardAlert } from './Alert';
import { useCardState } from './contexts';
import { FlowCard } from './FlowCard';

export const LoadingCard = () => {
  const card = useCardState();
  return (
    <FlowCard.OuterContainer>
      <FlowCard.Content>
        <CardAlert>{card.error}</CardAlert>
        <Flex
          direction='col'
          justify='center'
          align='center'
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
      </FlowCard.Content>
    </FlowCard.OuterContainer>
  );
};
