import { useSafeLayoutEffect } from '@clerk/shared/react/index';
import type { UseDismissProps, UseFloatingOptions, UseRoleProps } from '@floating-ui/react';
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

import type { LocalizationKey } from '../customizables';
import { Box, descriptors, Flex, Heading, Icon, Span, useAppearance } from '../customizables';
import { transitionDurationValues, transitionTiming } from '../foundations/transitions';
import { useDirection, usePrefersReducedMotion, useScrollLock } from '../hooks';
import { Close as CloseIcon } from '../icons';
import type { ThemableCssProp } from '../styledSystem';
import { common } from '../styledSystem';
import { colors } from '../utils/colors';
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
  direction: ReturnType<typeof useDirection>;
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
  const direction = useDirection();

  const { refs, context } = useFloating({
    open,
    onOpenChange,
    transform: false,
    strategy,
    placement: direction === 'ltr' ? 'right' : 'left',
    ...floatingProps,
  });

  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, dismissProps),
    useRole(context),
  ]);

  return (
    <DrawerContext.Provider
      value={{
        isOpen: open,
        setIsOpen: onOpenChange,
        strategy,
        portalProps: portalProps || {},
        refs,
        context,
        getFloatingProps,
        direction,
      }}
    >
      <FloatingPortal {...portalProps}>{children}</FloatingPortal>
    </DrawerContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Drawer.Overlay
 * -----------------------------------------------------------------------------------------------*/

export const FloatingOverlay = React.forwardRef(function FloatingOverlay(
  props: React.ComponentPropsWithoutRef<typeof Box>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { strategy } = useDrawerContext();
  const { disableScrollLock, enableScrollLock } = useScrollLock();

  useSafeLayoutEffect(() => {
    if (strategy !== 'fixed') {
      return;
    }
    enableScrollLock();
    return () => {
      disableScrollLock();
    };
  }, [strategy, disableScrollLock, enableScrollLock]);

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

  if (!isMounted) {
    return null;
  }

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
  const { strategy, refs, context, getFloatingProps, direction } = useDrawerContext();
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

  if (!isMounted) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={context}
      modal
      outsideElementsInert
      initialFocus={refs.floating}
    >
      <Box
        ref={mergedRefs}
        {...getFloatingProps()}
        sx={t => ({
          position: strategy,
          insetBlock: 0,
          insetInline: 0,
          pointerEvents: 'none',
          isolation: 'isolate',
          // When drawer is within the profile components, we need to ensure it is above the drawer
          // renders above the profile close button
          zIndex: strategy === 'absolute' ? t.zIndices.$modal : undefined,
        })}
        elementDescriptor={descriptors.drawerRoot}
      >
        <Flex
          elementDescriptor={descriptors.drawerContent}
          style={transitionStyles}
          direction='col'
          sx={t => ({
            // Apply the conditional right offset + the spread of the
            // box shadow to ensure it is fully offscreen before unmounting
            '--transform-offset':
              strategy === 'fixed'
                ? `calc((100% + ${t.space.$3} + ${t.space.$8x75}) * ${direction === 'rtl' ? -1 : 1})`
                : `calc((100% + ${t.space.$8x75}) * ${direction === 'rtl' ? -1 : 1})`,
            willChange: 'transform',
            position: strategy,
            insetBlock: strategy === 'fixed' ? t.space.$3 : 0,
            insetInlineEnd: strategy === 'fixed' ? t.space.$3 : 0,
            outline: 0,
            width: t.sizes.$100,
            maxWidth: strategy === 'fixed' ? `calc(100% - ${t.space.$6})` : '100%',
            backgroundColor: t.colors.$colorBackground,
            borderStartStartRadius: t.radii.$lg,
            borderEndStartRadius: t.radii.$lg,
            borderEndEndRadius: strategy === 'fixed' ? t.radii.$lg : 0,
            borderStartEndRadius: strategy === 'fixed' ? t.radii.$lg : 0,
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$borderAlpha150,
            overflow: 'hidden',
            pointerEvents: 'auto',
          })}
        >
          {children}
        </Flex>
      </Box>
    </FloatingFocusManager>
  );
});

Content.displayName = 'Drawer.Content';

/* -------------------------------------------------------------------------------------------------
 * Drawer.Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  title?: string | LocalizationKey;
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
          borderBlockEndColor: t.colors.$borderAlpha150,
          borderStartStartRadius: t.radii.$lg,
          borderStartEndRadius: t.radii.$lg,
          paddingBlock: title ? t.space.$3 : undefined,
          paddingInline: title ? t.space.$4 : undefined,
        }),
        sx,
      ]}
    >
      {title ? (
        <>
          <Heading
            localizationKey={title}
            as='h2'
            elementDescriptor={descriptors.drawerTitle}
            textVariant='h2'
            sx={{
              alignSelf: 'center',
            }}
          />
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

interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sx?: ThemableCssProp;
}

const Body = React.forwardRef<HTMLDivElement, BodyProps>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerBody}
      sx={[
        () => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }),
        props.sx,
      ]}
      {...props}
    >
      {children}
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Drawer.Footer
 * -----------------------------------------------------------------------------------------------*/

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  sx?: ThemableCssProp;
}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(({ children, sx, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.drawerFooter}
      sx={[
        t => ({
          display: 'flex',
          flexDirection: 'column',
          background: common.mergedColorsBackground(
            colors.setAlpha(t.colors.$colorBackground, 1),
            t.colors.$neutralAlpha50,
          ),
          borderBlockStartWidth: t.borderWidths.$normal,
          borderBlockStartStyle: t.borderStyles.$solid,
          borderBlockStartColor: t.colors.$borderAlpha100,
          borderEndStartRadius: t.radii.$xl,
          borderEndEndRadius: t.radii.$xl,
          paddingBlock: t.space.$3,
          paddingInline: t.space.$4,
        }),
        sx,
      ]}
      {...props}
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
        color: t.colors.$colorMutedForeground,
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
  actionsSlot: React.ReactNode;
  /**
   * @see https://floating-ui.com/docs/userole
   */
  roleProps?: UseRoleProps;
}

const Confirmation = React.forwardRef<HTMLDivElement, ConfirmationProps>(
  ({ open, onOpenChange, children, actionsSlot, roleProps }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const { animations: layoutAnimations } = useAppearance().parsedLayout;
    const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

    const { refs, context } = useFloating({
      open,
      onOpenChange,
      transform: false,
      strategy: 'absolute',
    });
    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context),
      useRole(context, { role: 'alertdialog', ...roleProps }),
    ]);

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

    if (!isMounted) {
      return null;
    }

    return (
      <>
        <Span
          elementDescriptor={descriptors.drawerConfirmationBackdrop}
          style={overlayTransitionStyles}
          sx={t => ({
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, ${colors.setAlpha(t.colors.$colorBackground, 0.28)}, ${t.colors.$colorBackground})`,
          })}
        />

        <FloatingFocusManager
          context={context}
          modal
          outsideElementsInert
          initialFocus={refs.floating}
        >
          <Box
            ref={mergedRefs}
            elementDescriptor={descriptors.drawerConfirmationRoot}
            style={modalTransitionStyles}
            {...getFloatingProps()}
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              rowGap: t.space.$6,
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
              padding: t.space.$4,
              borderStartStartRadius: t.radii.$md,
              borderStartEndRadius: t.radii.$md,
              boxShadow: `0 0 0 1px ${t.colors.$borderAlpha100}`,
            })}
          >
            {children}

            <Flex
              elementDescriptor={descriptors.drawerConfirmationActions}
              gap={3}
              justify='end'
            >
              {actionsSlot}
            </Flex>
          </Box>
        </FloatingFocusManager>
      </>
    );
  },
);

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
