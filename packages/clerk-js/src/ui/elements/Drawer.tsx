import { useSafeLayoutEffect } from '@clerk/shared/react/index';
import type { UseDismissProps, UseFloatingOptions } from '@floating-ui/react';
import {
  FloatingFocusManager,
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

import { transitionDurationValues, transitionTiming } from '../../ui/foundations/transitions';
import { Box, descriptors, Flex, Heading, Icon, Span, useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import { useScrollLock } from '../hooks/useScrollLock';
import { Close as CloseIcon } from '../icons';
import type { ThemableCssProp } from '../styledSystem';
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

export const FloatingOverlay = React.forwardRef(function FloatingOverlay(
  props: React.ComponentPropsWithoutRef<typeof Box>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { disableScrollLock, enableScrollLock } = useScrollLock();

  useSafeLayoutEffect(() => {
    enableScrollLock();

    return () => {
      disableScrollLock();
    };
  }, []);

  return (
    <Box
      ref={ref}
      {...props}
      elementDescriptor={descriptors.drawerBackdrop}
      sx={[
        t => ({
          inset: 0,
          backgroundColor: colors.setAlpha(t.colors.$colorBackground, 0.28),
        }),
        props.sx,
      ]}
    />
  );
});

const Overlay = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { strategy, context } = useDrawerContext();

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0 },
    open: { opacity: 1 },
    close: { opacity: 0 },
    common: {
      position: strategy,
      inset: 0,
      transitionProperty: 'opacity',
      transitionTimingFunction: transitionTiming.bezier,
    },
    duration: transitionDurationValues.drawer,
  });

  if (!isMounted) return null;

  return (
    <FloatingOverlay
      ref={ref}
      style={{
        ...transitionStyles,
      }}
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const { strategy, portalProps, refs, context, getFloatingProps } = useDrawerContext();
  const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { transform: `translate3d(var(--transform-offset), 0, 0)` },
    open: { transform: 'translate3d(0, 0, 0)' },
    close: { transform: `translate3d(var(--transform-offset), 0, 0)` },
    common: {
      transitionProperty: 'transform',
      transitionTimingFunction: transitionTiming.bezier,
    },
    duration: isMotionSafe ? transitionDurationValues.drawer : 0,
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal {...portalProps}>
      <FloatingFocusManager
        context={context}
        modal
        outsideElementsInert
        initialFocus={refs.floating}
      >
        <Flex
          ref={mergedRefs}
          elementDescriptor={descriptors.drawerContent}
          {...getFloatingProps()}
          style={transitionStyles}
          direction='col'
          sx={t => ({
            // Apply the conditional right offset + the spread of the
            // box shadow to ensure it is fully offscreen before unmounting
            '--transform-offset':
              strategy === 'fixed' ? `calc(100% + ${t.space.$3} + ${t.space.$8x75})` : `calc(100% + ${t.space.$8x75})`,
            willChange: 'transform',
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
  sx?: ThemableCssProp;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(({ title, children, sx }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerHeader}
      as='header'
      sx={[
        t => ({
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
        }),
        sx,
      ]}
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
        overflowX: 'hidden',
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

/* -------------------------------------------------------------------------------------------------
 * Drawer.Confirmation
 * -----------------------------------------------------------------------------------------------*/

interface ConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Confirmation = React.forwardRef<HTMLDivElement, ConfirmationProps>(({ open, onOpenChange, children }, ref) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  const { refs, context } = useFloating({
    open,
    onOpenChange,
    transform: false,
    strategy: 'absolute',
  });

  const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  const { styles: overlayTransitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0 },
    open: { opacity: 1 },
    close: { opacity: 0 },
    common: {
      transitionProperty: 'opacity',
      transitionTimingFunction: transitionTiming.bezier,
    },
    duration: transitionDurationValues.drawer,
  });

  const { isMounted, styles: modalTransitionStyles } = useTransitionStyles(context, {
    initial: { transform: 'translate3D(0, 100%, 0)' },
    open: { transform: 'translate3D(0, 0, 0)' },
    close: { transform: 'translate3D(0, 100%, 0)' },
    common: {
      transitionProperty: 'transform',
      transitionTimingFunction: transitionTiming.bezier,
    },
    duration: isMotionSafe ? transitionDurationValues.drawer : 0,
  });

  const { getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context)]);

  if (!isMounted) return null;

  return (
    <>
      <Span
        elementDescriptor={descriptors.drawerConfirmationBackdrop}
        style={overlayTransitionStyles}
        sx={t => ({
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to bottom, transparent, ${t.colors.$colorBackground})`,
        })}
      />

      <FloatingFocusManager
        context={context}
        modal
        outsideElementsInert
        initialFocus={refs.floating}
        visuallyHiddenDismiss
      >
        <Box
          ref={mergedRefs}
          elementDescriptor={descriptors.drawerConfirmationRoot}
          style={modalTransitionStyles}
          {...getFloatingProps()}
          sx={t => ({
            outline: 'none',
            willChange: 'transform',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: common.mergedColorsBackground(
              colors.setAlpha(t.colors.$colorBackground, 1),
              t.colors.$neutralAlpha50,
            ),
            borderBlockStartWidth: t.borderWidths.$normal,
            borderBlockStartStyle: t.borderStyles.$solid,
            borderBlockStartColor: t.colors.$neutralAlpha100,
            padding: t.space.$4,
          })}
        >
          {children}
        </Box>
      </FloatingFocusManager>
    </>
  );
});

Confirmation.displayName = 'Drawer.Confirmation';

export const Drawer = {
  Root,
  Overlay,
  Content,
  Header,
  Body,
  Footer,
  Confirmation,
  Close,
};
