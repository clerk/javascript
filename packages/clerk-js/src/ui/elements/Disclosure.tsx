import { useFloating, useMergeRefs, useTransitionStyles } from '@floating-ui/react';
import * as React from 'react';

import { Box, descriptors, Icon, SimpleButtonBase, useAppearance } from '../customizables';
import { transitionTiming } from '../foundations/transitions';
import { useFirstRender } from '../hooks';
import { ChevronDown } from '../icons';
import { common } from '../styledSystem';
import { colors } from '../utils';

/* -------------------------------------------------------------------------------------------------
 * Disclosure Context
 * -----------------------------------------------------------------------------------------------*/

interface DisclosureContextValue {
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}

const DisclosureContext = React.createContext<DisclosureContextValue | undefined>(undefined);

/* -------------------------------------------------------------------------------------------------
 * Disclosure.Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ children, defaultOpen = false, open: controlledOpen, onOpenChange }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
    const id = React.useId();

    const onToggle = React.useCallback(() => {
      if (isControlled) {
        onOpenChange?.(!isOpen);
      } else {
        setUncontrolledOpen(!isOpen);
      }
    }, [isControlled, isOpen, onOpenChange]);

    return (
      <DisclosureContext.Provider value={{ isOpen, onToggle, id }}>
        <Box
          ref={ref}
          elementDescriptor={descriptors.disclosureRoot}
          sx={t => ({
            width: '100%',
            borderRadius: t.radii.$lg,
            boxShadow: `inset 0 0 0 1px ${t.colors.$neutralAlpha100}`,
            backgroundColor: t.colors.$colorBackground,
            isolation: 'isolate',
          })}
        >
          {children}
        </Box>
      </DisclosureContext.Provider>
    );
  },
);

Root.displayName = 'Disclosure.Root';

/* -------------------------------------------------------------------------------------------------
 * Disclosure.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface TriggerProps {
  children: React.ReactNode;
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ children }, ref) => {
  const context = React.useContext(DisclosureContext);
  if (!context) {
    throw new Error('Disclosure.Trigger must be used within Disclosure.Root');
  }

  return (
    <SimpleButtonBase
      ref={ref}
      elementDescriptor={[descriptors.disclosureTrigger]}
      variant='unstyled'
      onClick={context.onToggle}
      aria-expanded={context.isOpen}
      aria-controls={context.id}
      sx={t => ({
        width: '100%',
        fontSize: t.fontSizes.$md,
        justifyContent: 'space-between',
        padding: t.sizes.$3,
        color: t.colors.$colorText,
        borderRadius: t.radii.$lg,
        zIndex: 2,
      })}
    >
      {children}
      <Icon
        icon={ChevronDown}
        colorScheme='neutral'
        size='md'
        sx={{ rotate: context.isOpen ? '180deg' : '0', transformOrigin: '50%' }}
        aria-hidden
      />
    </SimpleButtonBase>
  );
});

Trigger.displayName = 'Disclosure.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Disclosure.Content
 * -----------------------------------------------------------------------------------------------*/

interface ContentProps {
  children: React.ReactNode;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(({ children }, ref) => {
  const context = React.useContext(DisclosureContext);
  if (!context) {
    throw new Error('Disclosure.Content must be used within Disclosure.Root');
  }
  const { isOpen, id } = context;
  const { animations } = useAppearance().parsedLayout;
  const isFirstRender = useFirstRender();
  const { context: floatingContext, refs } = useFloating({
    open: isOpen,
  });
  const mergedRefs = useMergeRefs([ref, refs.setFloating]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(floatingContext, {
    initial: {
      gridTemplateRows: '0fr',
      opacity: 0,
    },
    open: {
      gridTemplateRows: '1fr',
      opacity: 1,
    },
    close: {
      gridTemplateRows: '0fr',
      opacity: 0,
    },
    common: {
      display: 'grid',
      gridTemplateRows: '0fr',
      transitionProperty: 'grid-template-rows opacity',
      transitionTimingFunction: transitionTiming.slowBezier,
    },
    // transitionDuration.slower
    duration: animations ? 280 : undefined,
  });

  if (!isMounted) {
    return null;
  }

  return (
    <Box
      ref={mergedRefs}
      style={animations && !isFirstRender ? transitionStyles : undefined}
      elementDescriptor={descriptors.disclosureContentRoot}
      id={id}
      sx={t => ({
        borderRadius: 'inherit',
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
        zIndex: 1,
      })}
    >
      <Box
        elementDescriptor={descriptors.disclosureContentBox}
        sx={{
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box
          elementDescriptor={descriptors.disclosureContentInner}
          sx={t => ({
            padding: t.space.$3,
          })}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
});

Content.displayName = 'Disclosure.Content';

export const Disclosure = {
  Root,
  Trigger,
  Content,
};
