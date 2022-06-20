import React from 'react';

import { Card as CardCustomisable, descriptors, useAppearance } from '../customizables';
import { generateFlowPartClassname } from '../customizables/classGeneration';
import { PropsOfComponent } from '../styledSystem';
import { ApplicationLogo } from './ApplicationLogo';
import { useFlowMetadata } from './contexts';
import { PoweredByClerkTag } from './PoweredByClerk';

type CardProps = PropsOfComponent<typeof CardCustomisable> & React.PropsWithChildren<{}>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();
  const logoMarkTag = true;

  return (
    <>
      {appearance.options.logoPlacement === 'outside' && <ApplicationLogo />}
      <CardCustomisable
        elementDescriptor={descriptors.card}
        className={generateFlowPartClassname(flowMetadata)}
        {...props}
        ref={ref}
      >
        {appearance.options.logoPlacement === 'inside' && <ApplicationLogo />}
        {props.children}
        {logoMarkTag && <PoweredByClerkTag />}
      </CardCustomisable>
    </>
  );
});

export const EmptyCard = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const flowMetadata = useFlowMetadata();
  return (
    <CardCustomisable
      elementDescriptor={descriptors.card}
      className={generateFlowPartClassname(flowMetadata)}
      {...props}
      ref={ref}
    />
  );
});
