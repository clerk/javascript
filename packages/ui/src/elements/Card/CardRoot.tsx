import React from 'react';

import { AppearanceContext, Col, descriptors, generateFlowPartClassname, useAppearance } from '../../customizables';
import type { ElementDescriptor } from '../../customizables/elementDescriptors';
import type { InternalTheme, PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { ApplicationLogo } from '../ApplicationLogo';
import { useFlowMetadata } from '../contexts';
import { ModalContext } from '../Modal';

// Flush overrides injected into parsedElements after baseTheme but before user overrides.
const getFlushElements = (t: InternalTheme) => ({
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
    paddingInline: 0,
    paddingBlock: 0,
    marginBlockStart: 0,
    marginInline: 0,
  },
  footer: {
    background: 'transparent',
    marginTop: t.space.$8,
    paddingTop: 0,
    rowGap: t.space.$8,
    '>:first-of-type': {
      padding: 0,
    },
    '>:not(:first-of-type)': {
      borderTopWidth: 0,
      padding: 0,
    },
  },
});

type CardRootProps = PropsOfComponent<typeof Col> & {
  /**
   * Override the visual elevation for this card instance.
   * When omitted, falls back to `appearance.options.elevation` for page-mounted
   * components, and `'raised'` for modals.
   * Profile and popover card roots pass `'raised'` explicitly to opt out of flush.
   */
  elevation?: 'raised' | 'flush';
};
export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>((props, ref) => {
  const { sx, children, elevation: elevationProp, ...rest } = props;
  const appearance = useAppearance();
  const flowMetadata = useFlowMetadata();

  const rawModalCtx = React.useContext(ModalContext);
  const isModal = rawModalCtx !== undefined;
  // Explicit prop wins; modals always raised; otherwise use appearance option
  const elevation = elevationProp ?? (isModal ? 'raised' : appearance.parsedOptions.elevation);
  const isFlush = elevation === 'flush';

  const augmentedAppearance = React.useMemo(() => {
    if (!isFlush) {
      return appearance;
    }
    const flushElements = getFlushElements(appearance.parsedInternalTheme);
    const newParsedElements = [appearance.parsedElements[0], flushElements, ...appearance.parsedElements.slice(1)];
    return { ...appearance, parsedElements: newParsedElements };
  }, [appearance, isFlush]);

  const cardBox = (
    <Col
      elementDescriptor={[descriptors.cardBox, props.elementDescriptor as ElementDescriptor]}
      className={generateFlowPartClassname(flowMetadata)}
      ref={ref}
      data-elevation={isFlush ? 'flush' : undefined}
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
