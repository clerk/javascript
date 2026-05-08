import React from 'react';

import { AppearanceContext, Col, descriptors, generateFlowPartClassname, useAppearance } from '../../customizables';
import type { ElementDescriptor } from '../../customizables/elementDescriptors';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { ApplicationLogo } from '../ApplicationLogo';
import { useFlowMetadata } from '../contexts';
import { ModalContext } from '../Modal';

const FLUSH_ELEMENTS = {
  cardBox: {
    borderWidth: 0,
    borderRadius: 0,
    boxShadow: 'none',
    overflow: 'visible',
  },
  card: {
    borderWidth: 0,
    borderRadius: 0,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    marginBlockStart: 0,
    marginInline: 0,
  },
  footer: {
    background: 'transparent',
  },
  scrollBox: {
    borderWidth: 0,
    borderRadius: 0,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    marginBlock: 0,
    marginInlineEnd: 0,
  },
  navbar: {
    background: 'transparent',
  },
  navbarMobileMenuRow: {
    background: 'transparent',
  },
};

type CardRootProps = PropsOfComponent<typeof Col>;
export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>((props, ref) => {
  const { sx, children, ...rest } = props;
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();

  const rawModalCtx = React.useContext(ModalContext);
  const isModal = rawModalCtx !== undefined;
  const isFlush = appearance.parsedOptions.elevation === 'flush' && !isModal;

  const augmentedAppearance = React.useMemo(() => {
    if (!isFlush) {
      return appearance;
    }
    const newParsedElements = [appearance.parsedElements[0], FLUSH_ELEMENTS, ...appearance.parsedElements.slice(1)];
    return { ...appearance, parsedElements: newParsedElements };
  }, [appearance, isFlush]);

  const cardBox = (
    <Col
      elementDescriptor={[descriptors.cardBox, props.elementDescriptor as ElementDescriptor]}
      className={generateFlowPartClassname(flowMetadata)}
      ref={ref}
      sx={[
        t => ({
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
  );

  return (
    <>
      {appearance.parsedOptions.logoPlacement === 'outside' && (
        <ApplicationLogo
          sx={t => ({
            position: 'relative',
            [mqu.sm]: {
              margin: `0 0 ${t.space.$7} 0`,
            },
          })}
        />
      )}
      {isFlush ? (
        <AppearanceContext.Provider value={{ value: augmentedAppearance }}>{cardBox}</AppearanceContext.Provider>
      ) : (
        cardBox
      )}
    </>
  );
});
