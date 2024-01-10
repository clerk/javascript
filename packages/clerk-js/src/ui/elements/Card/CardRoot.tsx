import React from 'react';

import { Col, descriptors, generateFlowPartClassname, useAppearance } from '../../customizables';
import type { ElementDescriptor } from '../../customizables/elementDescriptors';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
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
            position: 'relative',
            [mqu.sm]: {
              margin: `0 0 ${t.space.$7} 0`,
            },
          })}
        />
      )}
      <Col
        elementDescriptor={[descriptors.cardBox, props.elementDescriptor as ElementDescriptor]}
        className={generateFlowPartClassname(flowMetadata)}
        ref={ref}
        sx={[
          t => ({
            maxWidth: `calc(100vw - ${t.sizes.$20})`,
            width: t.sizes.$100,
            boxShadow: t.shadows.$cardBoxShadow,
            borderRadius: t.radii.$xl,
            overflow: 'hidden',
            color: t.colors.$colorText,
            position: 'relative',
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
