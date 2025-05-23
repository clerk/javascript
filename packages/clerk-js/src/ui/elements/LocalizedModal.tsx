import { createContextAndHook } from '@clerk/shared/react';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import React from 'react';

import { descriptors, Flex } from '../customizables';
import type { ThemableCssProp } from '../styledSystem';
import { animations } from '../styledSystem';
import { withFloatingTree } from './contexts';

export const [LocalizedModalContext, _, useUnsafeLocalizedModalContext] = createContextAndHook<{ toggle?: () => void }>(
  'LocalizedModalContext',
);

type LocalizedModalProps = React.PropsWithChildren<{
  id?: string;
  handleOpen?: () => void;
  handleClose?: () => void;
  contentSx?: ThemableCssProp;
  style?: React.CSSProperties;
  anchorRef: React.RefObject<HTMLElement>;
}>;

export const LocalizedModal = withFloatingTree((props: LocalizedModalProps) => {
  const { handleClose, handleOpen, contentSx, id, style, anchorRef } = props;
  const { x, y, refs, strategy } = useFloating({
    placement: 'bottom',
    middleware: [offset(16), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  React.useEffect(() => {
    if (anchorRef.current) {
      (refs.reference as unknown as (node: HTMLElement | null) => void)(anchorRef.current);
    }
  }, [anchorRef, refs]);

  // Modal open/close logic (optional, can be extended)
  React.useEffect(() => {
    handleOpen?.();
    return () => handleClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocalizedModalContext.Provider value={{ value: {} }}>
      <Flex
        id={id}
        elementDescriptor={descriptors.modalContent}
        ref={refs.floating as React.Ref<HTMLDivElement>}
        aria-modal='true'
        role='dialog'
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          zIndex: 1000,
          ...style,
        }}
        sx={[
          t => ({
            backgroundColor: t.colors.$colorBackground,
            boxShadow: t.shadows.$menuShadow,
            borderRadius: t.radii.$lg,
            outline: 0,
            animation: `${animations.modalSlideAndFade} 180ms ${t.transitionTiming.$easeOut}`,
            minWidth: '320px',
            maxWidth: '100%',
            padding: t.space.$6,
          }),
          contentSx,
        ]}
      >
        {props.children}
      </Flex>
    </LocalizedModalContext.Provider>
  );
});
