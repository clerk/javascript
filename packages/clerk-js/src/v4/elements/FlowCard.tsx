import React from 'react';

import { Card, descriptors, Flex } from '../customizables';
import { generateFlowMetadataClassname } from '../customizables/classGeneration';
import { CardStateProvider, FlowMetadata, FlowMetadataProvider } from './contexts';

type FlowCardRootProps = React.PropsWithChildren<FlowMetadata>;

const FlowCardRoot = (props: FlowCardRootProps): JSX.Element => {
  const { children, flow, page, ...rest } = props;

  return (
    <FlowMetadataProvider
      flow={flow}
      page={page}
    >
      <CardStateProvider>
        <Flex
          elementDescriptor={descriptors.root}
          className={generateFlowMetadataClassname(props)}
        >
          <Card
            elementDescriptor={descriptors.card}
            {...rest}
          >
            {children}
          </Card>
        </Flex>
      </CardStateProvider>
    </FlowMetadataProvider>
  );
};

export const FlowCard = {
  Root: FlowCardRoot,
};
