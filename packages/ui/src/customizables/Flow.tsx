import React from 'react';

import type { FlowMetadata } from '../elements/contexts';
import { FlowMetadataProvider, useFlowMetadata } from '../elements/contexts';
import { InvisibleRootBox } from '../elements/InvisibleRootBox';
import type { ThemableCssProp } from '../styledSystem';
import { InternalThemeProvider } from '../styledSystem';
import { generateFlowClassname } from './classGeneration';
import { descriptors } from './index';

type FlowRootProps = React.PropsWithChildren & FlowMetadata & { sx?: ThemableCssProp };

const Root = (props: FlowRootProps & { isFlowReady?: boolean }) => {
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
