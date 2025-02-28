import type { UseFloatingOptions } from '@floating-ui/react';
import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import * as React from 'react';

import { Box, descriptors, Flex, Icon, useAppearance } from '../customizables';
import { Close as CloseIcon } from '../icons';
import { InternalThemeProvider } from '../styledSystem';
import { IconButton } from './IconButton';

type FloatingPortalProps = React.ComponentProps<typeof FloatingPortal>;

interface DrawerContext {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  strategy: UseFloatingOptions['strategy'];
  portalId: FloatingPortalProps['id'];
  portalRef: FloatingPortalProps['root'];
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
}

const DrawerContext = React.createContext<DrawerContext | null>(null);

const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be wrapped in <Drawer.Root>');
  }
  return context;
};

interface RootProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: UseFloatingOptions['strategy'];
  portalId?: FloatingPortalProps['id'];
  portalRef?: FloatingPortalProps['root'];
}

function Root({ children, open, onOpenChange, strategy = 'fixed', portalId, portalRef }: RootProps) {
  const { refs, context } = useFloating({
    open,
    onOpenChange,
    transform: false,
    strategy,
  });

  const { getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context)]);

  return (
    <InternalThemeProvider>
      <DrawerContext.Provider
        value={{
          isOpen: open,
          setIsOpen: onOpenChange,
          strategy,
          portalId,
          portalRef,
          refs,
          context,
          getFloatingProps,
        }}
      >
        {children}
      </DrawerContext.Provider>
    </InternalThemeProvider>
  );
}

function Overlay() {
  const { strategy, refs, context } = useDrawerContext();

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0 },
    open: { opacity: 1 },
    close: { opacity: 0 },
    common: {
      transitionProperty: 'opacity',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      open: 250,
      close: 200,
    },
  });

  if (!isMounted) return null;

  return (
    <Box
      ref={refs.setFloating}
      elementDescriptor={descriptors.drawerOverlay}
      style={transitionStyles}
      sx={t => ({
        position: strategy,
        inset: 0,
        backgroundColor: t.colors.$whiteAlpha300,
      })}
    />
  );
}

interface ContentProps {
  children: React.ReactNode;
}

function Content({ children }: ContentProps) {
  const { animations } = useAppearance().parsedLayout;
  const { strategy, portalId, portalRef, refs, context, getFloatingProps } = useDrawerContext();

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { transform: 'translateX(100%)' },
    open: { transform: 'translateX(0)' },
    close: { transform: 'translateX(100%)' },
    common: {
      transitionProperty: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      open: 250,
      close: 200,
    },
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal
      id={portalId}
      root={portalRef}
    >
      <FloatingFocusManager
        context={context}
        modal
        initialFocus={refs.floating}
      >
        <Flex
          ref={refs.setFloating}
          elementDescriptor={descriptors.drawerRoot}
          {...getFloatingProps()}
          sx={t => ({
            position: strategy,
            insetBlock: strategy === 'fixed' ? t.space.$3 : 0,
            insetInlineEnd: strategy === 'fixed' ? t.space.$3 : 0,
            outline: 0,
          })}
        >
          <Flex
            elementDescriptor={descriptors.drawerContent}
            style={animations ? transitionStyles : undefined}
            sx={t => ({
              width: t.sizes.$100,
              backgroundColor: t.colors.$colorBackground,
              borderStartStartRadius: t.radii.$xl,
              borderEndStartRadius: t.radii.$xl,
              borderEndEndRadius: strategy === 'fixed' ? t.radii.$xl : 0,
              borderStartEndRadius: strategy === 'fixed' ? t.radii.$xl : 0,
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$neutralAlpha100,
              boxShadow: t.shadows.$cardBoxShadow,
              zIndex: t.zIndices.$modal,
            })}
          >
            {children}
          </Flex>
        </Flex>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

function Close() {
  const { setIsOpen } = useDrawerContext();
  return (
    <IconButton
      elementDescriptor={descriptors.drawerClose}
      variant='ghost'
      aria-label='Close drawer'
      onClick={() => setIsOpen(false)}
      icon={
        <Icon
          icon={CloseIcon}
          size='sm'
        />
      }
      sx={t => ({
        color: t.colors.$colorTextSecondary,
        padding: t.space.$3,
      })}
    />
  );
}

export const Drawer = {
  Root,
  Overlay,
  Content,
  Close,
};
