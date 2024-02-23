import React, { useEffect } from 'react';

import type { FlowMetadata } from '../elements';
import { FlowMetadataProvider, InvisibleRootBox, useFlowMetadata } from '../elements';
import type { ThemableCssProp } from '../styledSystem';
import { InternalThemeProvider } from '../styledSystem';
import { generateFlowClassname } from './classGeneration';
import { descriptors } from './index';

type FlowRootProps = React.PropsWithChildren & FlowMetadata & { sx?: ThemableCssProp };

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
  const { setPart } = useFlowMetadata();

  useEffect(() => {
    setPart(props.part);
  }, [props.part]);

  return <InternalThemeProvider>{props.children}</InternalThemeProvider>;
};

export const Flow = {
  Root,
  Part,
};
