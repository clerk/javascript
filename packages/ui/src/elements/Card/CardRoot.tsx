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
            /**
             * All components should create their own stack context
             * https://developer.mozilla.org/en-US/docs/Web/CSS/isolation
             */
            isolation: 'isolate',
            maxWidth: `calc(100vw - ${t.sizes.$10})`,
            width: t.sizes.$100,
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$borderAlpha150,
            borderRadius: t.radii.$xl,
            color: t.colors.$colorForeground,
            position: 'relative',
            overflow: 'hidden',
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
