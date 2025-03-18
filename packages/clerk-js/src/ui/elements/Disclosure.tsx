import * as React from 'react';

import type { LocalizationKey } from '../customizables';
import { Box, descriptors, Icon, SimpleButton, Span, useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import { ChevronDown } from '../icons';
import type { ThemableCssProp } from '../styledSystem';
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
  text: string | LocalizationKey;
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ text }, ref) => {
  const context = React.useContext(DisclosureContext);
  if (!context) {
    throw new Error('Disclosure.Trigger must be used within Disclosure.Root');
  }

  return (
    <SimpleButton
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
      <Span localizationKey={text} />
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  if (!context) {
    throw new Error('Disclosure.Content must be used within Disclosure.Root');
  }
  const { isOpen, id } = context;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const animation: ThemableCssProp = t => ({
    transition: isMotionSafe
      ? `grid-template-rows ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`
      : 'none',
  });

  return (
    <Box
      ref={ref}
      elementDescriptor={descriptors.disclosureContentRoot}
      id={id}
      sx={[
        _ => ({
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          zIndex: 1,
        }),
        animation,
      ]}
      // @ts-ignore - Needed until React 19 support
      inert={isOpen ? undefined : 'true'}
    >
      <Box
        elementDescriptor={descriptors.disclosureContentInner}
        sx={{
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box
          elementDescriptor={descriptors.disclosureContent}
          sx={t => ({
            padding: t.space.$3,
            borderRadius: t.radii.$lg,
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$neutralAlpha100,
            background: common.mergedColorsBackground(
              colors.setAlpha(t.colors.$colorBackground, 1),
              t.colors.$neutralAlpha50,
            ),
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
