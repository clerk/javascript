import { useFloating, useMergeRefs, useTransitionStyles } from '@floating-ui/react';
import * as React from 'react';

import { Box, descriptors, Icon, SimpleButton, useAppearance } from '../../customizables';
import { transitionTiming } from '../../foundations/transitions';
import { useFirstRender } from '../../hooks';
import { ChevronDown } from '../../icons';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

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
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$neutralAlpha100,
            background: t.colors.$colorBackground,
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
    <SimpleButton
      ref={ref}
      elementDescriptor={descriptors.disclosureTrigger}
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
    </SimpleButton>
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
    },
    open: {
      gridTemplateRows: '1fr',
    },
    close: {
      gridTemplateRows: '0fr',
    },
    common: {
      display: 'grid',
      gridTemplateRows: '0fr',
      transitionProperty: 'grid-template-rows',
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
        backgroundColor: t.colors.$colorBackground,
        borderRadius: 'inherit',
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
        marginInline: `calc(${t.borderWidths.$normal} * -1)`,
        marginBlockEnd: `calc(${t.borderWidths.$normal} * -1)`,
        background: common.mergedColorsBackground(
          colors.setAlpha(t.colors.$colorBackground, 1),
          t.colors.$neutralAlpha50,
        ),
      })}
    >
      <Box
        elementDescriptor={descriptors.disclosureContentBox}
        sx={{
          overflow: 'hidden',
          minHeight: 0,
          borderRadius: 'inherit',
        }}
      >
        <Box
          elementDescriptor={descriptors.disclosureContentInner}
          sx={t => ({
            padding: t.space.$3,
            borderRadius: 'inherit',
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
