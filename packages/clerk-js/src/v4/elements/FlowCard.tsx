import React from 'react';

import { Card, descriptors, Flex, useAppearance } from '../customizables';
import { generateFlowMetadataClassname } from '../customizables/classGeneration';
import { defaultTheme } from '../foundations';
import { InternalThemeProvider } from '../styledSystem';
import { CardStateProvider, FlowMetadata, FlowMetadataProvider } from './contexts';

type FlowCardRootProps = React.PropsWithChildren<FlowMetadata>;

const FlowCardRoot = (props: FlowCardRootProps): JSX.Element => {
  // TODO: useAppearance should transform an appearance -> parseAppearance
  const { parsedAppearance } = useAppearance();

  return (
    <InternalThemeProvider theme={{ ...defaultTheme, ...parsedAppearance[props.flow]?.variables }}>
      <FlowMetadataProvider
        flow={props.flow}
        page={props.page}
      >
        <CardStateProvider>
          <CardContent {...props} />
        </CardStateProvider>
      </FlowMetadataProvider>
    </InternalThemeProvider>
  );
};

const CardContent = (props: FlowCardRootProps) => {
  const { flow, page, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.root}
      className={generateFlowMetadataClassname(props)}
    >
      <Card
        elementDescriptor={descriptors.card}
        {...rest}
      />
    </Flex>
  );
};

export const FlowCard = {
  Root: FlowCardRoot,
};
