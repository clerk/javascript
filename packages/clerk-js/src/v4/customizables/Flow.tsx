import React from 'react';

import { Col, descriptors } from '../customizables';
import { FlowMetadata, FlowMetadataProvider, useFlowMetadata } from '../elements';
import { InternalThemeProvider } from '../styledSystem';
import { generateFlowClassname } from './classGeneration';

type FlowRootProps = React.PropsWithChildren<{}> & FlowMetadata;

const Root = (props: FlowRootProps) => {
  return (
    <FlowMetadataProvider flow={props.flow}>
      <InternalThemeProvider>
        <Col
          elementDescriptor={descriptors.root}
          className={generateFlowClassname(props)}
          {...props}
          sx={{ width: 'fit-content' }}
        />
      </InternalThemeProvider>
    </FlowMetadataProvider>
  );
};

type FlowPartProps = React.PropsWithChildren<Pick<FlowMetadata, 'part'>>;

const Part = (props: FlowPartProps) => {
  const { flow } = useFlowMetadata();
  return (
    <FlowMetadataProvider
      flow={flow}
      part={props.part}
    >
      <InternalThemeProvider>{props.children}</InternalThemeProvider>
    </FlowMetadataProvider>
  );
};

export const Flow = {
  Root,
  Part,
};
