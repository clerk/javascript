import React from 'react';

import { Card, descriptors, Flex, useAppearance } from '../customizables';
import { generateFlowMetadataClassname } from '../customizables/classGeneration';
import { InternalThemeProvider, PropsOfComponent } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { CardStateProvider, FlowMetadata, FlowMetadataProvider, useFlowMetadata } from './contexts';
import { PoweredByClerkTag } from './PoweredByClerk';

type FlowCardRootProps = React.PropsWithChildren<FlowMetadata>;

const OuterContainer = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>((props, ref) => {
  const flowMetadata = useFlowMetadata();
  // TODO: Logo will go here
  return (
    <Flex
      elementDescriptor={descriptors.root}
      className={generateFlowMetadataClassname(flowMetadata)}
      direction='col'
      {...props}
      ref={ref}
    />
  );
});

const Content = (props: PropsOfComponent<typeof Card> & { logoMarkTag?: boolean }) => {
  const { logoMarkTag = true, ...rest } = props;
  return (
    <Card
      elementDescriptor={descriptors.card}
      {...rest}
    >
      <ApplicationLogo />
      {props.children}
      {logoMarkTag && <PoweredByClerkTag />}
    </Card>
  );
};

export const FlowCard = {
  OuterContainer,
  Content,
};

export const withFlowCardContext = <C,>(Component: C, options: FlowMetadata & { displayName?: string }): C => {
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

  if (__DEV__) {
    HOC.displayName = options.displayName || 'FlowCardComponent';
  }

  return HOC as any as C;
};
