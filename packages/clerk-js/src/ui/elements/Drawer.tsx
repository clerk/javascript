import type { UseDismissProps, UseFloatingOptions } from '@floating-ui/react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import * as React from 'react';

import { Box, descriptors, Flex, Heading, Icon } from '../customizables';
import { useMotionSafe } from '../hooks';
import { Close as CloseIcon } from '../icons';
import { common, InternalThemeProvider } from '../styledSystem';
import { colors } from '../utils';
import { IconButton } from './IconButton';

type FloatingPortalProps = React.ComponentProps<typeof FloatingPortal>;

/* -------------------------------------------------------------------------------------------------
 * Drawer Context
 * -----------------------------------------------------------------------------------------------*/

interface DrawerContext {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  strategy: UseFloatingOptions['strategy'];
  refs: ReturnType<typeof useFloating>['refs'];
  context: ReturnType<typeof useFloating>['context'];
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
  portalProps: FloatingPortalProps;
}

const DrawerContext = React.createContext<DrawerContext | null>(null);

export const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be wrapped in <Drawer.Root>');
  }
  return context;
};

/* -------------------------------------------------------------------------------------------------
 * Drawer.Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * The strategy to use when positioning the floating element.
   * @default 'fixed'
   * @see https://floating-ui.com/docs/useFloating#strategy
   */
  strategy?: UseFloatingOptions['strategy'];
  /**
   * @see https://floating-ui.com/docs/useFloating
   */
  floatingProps?: Omit<UseFloatingOptions, 'open' | 'onOpenChange' | 'strategy' | 'transform'>;
  /**
   * @see https://floating-ui.com/docs/FloatingPortal
   */
  portalProps?: FloatingPortalProps;
  /**
   * @see https://floating-ui.com/docs/useDismiss
   */
  dismissProps?: UseDismissProps;
}

function Root({
  children,
  open,
  onOpenChange,
  strategy = 'fixed',
  floatingProps,
  portalProps,
  dismissProps,
}: RootProps) {
  const { refs, context } = useFloating({
    open,
    onOpenChange,
    transform: false,
    strategy,
    ...floatingProps,
  });

  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, dismissProps),
    useRole(context),
  ]);

  return (
    <InternalThemeProvider>
      <DrawerContext.Provider
        value={{
          isOpen: open,
          setIsOpen: onOpenChange,
          strategy,
          portalProps: portalProps || {},
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

/* -------------------------------------------------------------------------------------------------
 * Drawer.Overlay
 * -----------------------------------------------------------------------------------------------*/

const Overlay = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { strategy, refs, context } = useDrawerContext();
  const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0 },
    open: { opacity: 1 },
    close: { opacity: 0 },
    common: {
      position: strategy,
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
      ref={mergedRefs}
      as={FloatingOverlay}
      // @ts-ignore - lockScroll exists on FloatOverlay component
      lockScroll
      elementDescriptor={descriptors.drawerBackdrop}
      style={transitionStyles}
      sx={t => ({
        backgroundColor: t.colors.$drawerBackdrop,
      })}
    />
  );
});

Overlay.displayName = 'Drawer.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Drawer.Content
 * -----------------------------------------------------------------------------------------------*/

interface ContentProps {
  children: React.ReactNode;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(({ children }, ref) => {
  const isMotionSafe = useMotionSafe();
  const { strategy, portalProps, refs, context, getFloatingProps } = useDrawerContext();
  const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { transform: 'translateX(100%)' },
    open: { transform: 'translateX(0)' },
    close: { transform: 'translateX(100%)' },
    common: {
      transitionProperty: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: isMotionSafe
      ? {
          open: 250,
          close: 200,
        }
      : 0,
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal {...portalProps}>
      <FloatingFocusManager
        context={context}
        modal
        initialFocus={refs.floating}
      >
        <Flex
          ref={mergedRefs}
          elementDescriptor={descriptors.drawerContent}
          {...getFloatingProps()}
          style={transitionStyles}
          direction='col'
          sx={t => ({
            position: strategy,
            insetBlock: strategy === 'fixed' ? t.space.$3 : 0,
            insetInlineEnd: strategy === 'fixed' ? t.space.$3 : 0,
            outline: 0,
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
            overflow: 'hidden',
            zIndex: t.zIndices.$modal,
          })}
        >
          {children}
        </Flex>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});

Overlay.displayName = 'Drawer.Content';

/* -------------------------------------------------------------------------------------------------
 * Drawer.Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(({ title, children }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerHeader}
      as='header'
      sx={t => ({
        display: 'flex',
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        borderBlockEndWidth: t.borderWidths.$normal,
        borderBlockEndStyle: t.borderStyles.$solid,
        borderBlockEndColor: t.colors.$neutralAlpha100,
        borderStartStartRadius: t.radii.$xl,
        borderStartEndRadius: t.radii.$xl,
        paddingBlock: title ? t.space.$3 : undefined,
        paddingInline: title ? t.space.$4 : undefined,
      })}
    >
      {title ? (
        <>
          <Heading
            as='h2'
            elementDescriptor={descriptors.drawerTitle}
            textVariant='h2'
            sx={{
              alignSelf: 'center',
            }}
          >
            {title}
          </Heading>
          <Close />
        </>
      ) : (
        children
      )}
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Drawer.Body
 * -----------------------------------------------------------------------------------------------*/

interface BodyProps {
  children: React.ReactNode;
}

const Body = React.forwardRef<HTMLDivElement, BodyProps>(({ children }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerBody}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflowY: 'auto',
      }}
    >
      {children}
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Drawer.Footer
 * -----------------------------------------------------------------------------------------------*/

interface FooterProps {
  children?: React.ReactNode;
}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(({ children }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerFooter}
      sx={t => ({
        display: 'flex',
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        borderBlockStartWidth: t.borderWidths.$normal,
        borderBlockStartStyle: t.borderStyles.$solid,
        borderBlockStartColor: t.colors.$neutralAlpha100,
        borderEndStartRadius: t.radii.$xl,
        borderEndEndRadius: t.radii.$xl,
        paddingBlock: t.space.$3,
        paddingInline: t.space.$4,
      })}
    >
      {children}
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Drawer.Close
 * -----------------------------------------------------------------------------------------------*/

const Close = React.forwardRef<HTMLButtonElement>((_, ref) => {
  const { setIsOpen } = useDrawerContext();
  return (
    <IconButton
      ref={ref}
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
        marginInlineStart: 'auto',
      })}
    />
  );
});

Close.displayName = 'Drawer.Close';

export const Drawer = {
  Root,
  Overlay,
  Content,
  Header,
  Body,
  Footer,
  Close,
};
