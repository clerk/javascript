import React from 'react';

import { Col, descriptors, generateFlowPartClassname, useAppearance } from '../../customizables';
import type { ElementDescriptor } from '../../customizables/elementDescriptors';
import type { PropsOfComponent } from '../../styledSystem';
import { common, mqu } from '../../styledSystem';
import { ApplicationLogo } from '../ApplicationLogo';
import { useFlowMetadata } from '../contexts';

type CardRootProps = PropsOfComponent<typeof Col>;
export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>((props, ref) => {
  const { sx, children, ...rest } = props;
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();

  return (
    <>
      {appearance.parsedLayout.logoPlacement === 'outside' && (
        <ApplicationLogo
          sx={t => ({
            [mqu.sm]: {
              margin: `0 0 ${t.space.$7} 0`,
            },
          })}
        />
      )}
      <Col
        elementDescriptor={[descriptors.card, props.elementDescriptor as ElementDescriptor]}
        className={generateFlowPartClassname(flowMetadata)}
        ref={ref}
        sx={[
          t => ({
            background: `linear-gradient(${t.colors.$blackAlpha100},${t.colors.$blackAlpha100}), linear-gradient(${t.colors.$colorBackground}, ${t.colors.$colorBackground})`,
            maxWidth: `calc(100vw - ${t.sizes.$20})`,
            width: t.sizes.$100,
            boxShadow: common.shadows(t).cardRootShadow,
            borderRadius: t.radii.$xl,
            color: t.colors.$colorText,
          }),
          sx,
        ]}
        {...rest}
      >
        {children}
      </Col>
    </>
  );
});
