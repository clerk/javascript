import React from 'react';

import { Card, descriptors, Flex, useAppearance } from '../customizables';
import { generateFlowMetadataClassname } from '../customizables/classGeneration';
import { InternalThemeProvider } from '../styledSystem';
import { CardStateProvider, FlowMetadata, FlowMetadataProvider, useFlowMetadata } from './contexts';

type FlowCardRootProps = React.PropsWithChildren<FlowMetadata>;

const OuterContainer = (props: React.PropsWithChildren<any>) => {
  const flowMetadata = useFlowMetadata();
  // TODO: Logo will go here
  return (
    <Flex
      elementDescriptor={descriptors.root}
      className={generateFlowMetadataClassname(flowMetadata)}
      {...props}
    />
  );
};

const Content = (props: React.PropsWithChildren<any>) => {
  return (
    <Card
      elementDescriptor={descriptors.card}
      {...props}
    />
  );
};

export const FlowCard = {
  OuterContainer,
  Content,
};

export const withFlowCardContext = <C,>(Component: C, options: FlowMetadata): C => {
  const { page, flow } = options;
  const HOC = (props: any) => {
    const { parsedInternalTheme } = useAppearance();
    return (
      <InternalThemeProvider theme={parsedInternalTheme[flow]}>
        <FlowMetadataProvider
          flow={flow}
          page={page}
        >
          <CardStateProvider>
            {/*// @ts-ignore*/}
            <Component {...props} />
          </CardStateProvider>
        </FlowMetadataProvider>
      </InternalThemeProvider>
    );
  };
  return HOC as any as C;
};
