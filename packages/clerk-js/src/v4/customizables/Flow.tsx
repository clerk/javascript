import React from 'react';

import { descriptors } from '../customizables';
import { FlowMetadata, FlowMetadataProvider, InvisibleRootBox, useFlowMetadata } from '../elements';
import { InternalThemeProvider } from '../styledSystem';
import { generateFlowClassname } from './classGeneration';

type FlowRootProps = React.PropsWithChildren<{}> & FlowMetadata;

const Root = (props: FlowRootProps) => {
  return (
    <FlowMetadataProvider flow={props.flow}>
      <InternalThemeProvider>
        <InvisibleRootBox
          elementDescriptor={descriptors.rootBox}
          className={generateFlowClassname(props)}
          {...props}
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
