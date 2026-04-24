'use client';

import { Composite, CompositeItem } from '@floating-ui/react';
import React, {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AccordionContextValue {
  value: string[];
  toggle: (itemValue: string) => void;
  disabled: boolean;
  accordionId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion compound components must be used within <Accordion>');
  }
  return ctx;
}

interface AccordionItemContextValue {
  itemValue: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error('Accordion.Trigger/Header/Panel must be used within <Accordion.Item>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Accordion (root)
// ---------------------------------------------------------------------------

export interface AccordionProps extends ComponentProps<'div'> {
  /** Controlled open items. */
  value?: string[];
  /** Initial open items (uncontrolled). */
  defaultValue?: string[];
  /** Called when open items change. */
  onValueChange?: (value: string[]) => void;
  /** When true, only one item can be open at a time. @default false */
  type?: 'single' | 'multiple';
  /** Disable all items. @default false */
  disabled?: boolean;
  children: ReactNode;
}

function AccordionRoot(props: AccordionProps) {
  const { render, type = 'multiple', disabled = false, children, ...otherProps } = props;

  const [value, setValue] = useControllableState(props.value, props.defaultValue ?? [], props.onValueChange);

  const accordionId = useId();

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = value.includes(itemValue);
      if (isOpen) {
        setValue(value.filter(v => v !== itemValue));
      } else if (type === 'single') {
        setValue([itemValue]);
      } else {
        setValue([...value, itemValue]);
      }
    },
    [type, value, setValue],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({ value, toggle, disabled, accordionId }),
    [value, toggle, disabled, accordionId],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <Composite
        orientation='vertical'
        render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
          // aria-orientation is injected by Composite but is not valid on a
          // generic <div> (no widget role). Strip it to avoid an axe violation.
          const { 'aria-orientation': _ao, ...restCompositeProps } = compositeProps;

          const defaultProps: Record<string, unknown> = {
            'data-cl-slot': 'accordion-root',
            onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
              if (event.key !== 'Home' && event.key !== 'End') return;
              event.preventDefault();
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>('[data-cl-slot="accordion-trigger"]:not([disabled])'),
              );
              if (items.length === 0) return;
              const target = event.key === 'Home' ? items[0] : items[items.length - 1];
              target.focus();
            },
          };

          const merged = mergeProps<'div'>(
            defaultProps,
            mergeProps<'div'>(otherProps, restCompositeProps as Record<string, unknown>),
          );

          return renderElement({
            defaultTagName: 'div',
            render,
            props: merged,
          })!;
        }}
      >
        {children}
      </Composite>
    </AccordionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Accordion.Item
// ---------------------------------------------------------------------------

export interface AccordionItemProps extends ComponentProps<'div'> {
  /** Unique value identifying this item. */
  value: string;
  /** Disable this specific item. */
  disabled?: boolean;
}

function AccordionItem(props: AccordionItemProps) {
  const { render, value: itemValue, disabled: itemDisabled, ...otherProps } = props;
  const ctx = useAccordionContext();

  const open = ctx.value.includes(itemValue);
  const disabled = itemDisabled ?? ctx.disabled;
  const triggerId = `${ctx.accordionId}-trigger-${itemValue}`;
  const panelId = `${ctx.accordionId}-panel-${itemValue}`;

  const itemContextValue = useMemo<AccordionItemContextValue>(
    () => ({ itemValue, open, disabled, triggerId, panelId }),
    [itemValue, open, disabled, triggerId, panelId],
  );

  const state = { open, disabled };

  const defaultProps = {
    'data-cl-slot': 'accordion-item',
  };

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      {renderElement({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
          disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </AccordionItemContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Accordion.Header
// ---------------------------------------------------------------------------

export interface AccordionHeaderProps extends ComponentProps<'h3'> {}

function AccordionHeader(props: AccordionHeaderProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    'data-cl-slot': 'accordion-header',
  };

  return renderElement({
    defaultTagName: 'h3',
    render,
    props: mergeProps<'h3'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Accordion.Trigger
// ---------------------------------------------------------------------------

export interface AccordionTriggerProps extends ComponentProps<'button'> {}

function AccordionTrigger(props: AccordionTriggerProps) {
  const { render, children, ...otherProps } = props;
  const ctx = useAccordionContext();
  const { itemValue, open, disabled, triggerId, panelId } = useAccordionItemContext();

  const state = { open, disabled };

  return (
    <CompositeItem
      disabled={disabled}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          'data-cl-slot': 'accordion-trigger',
          id: triggerId,
          type: 'button' as const,
          'aria-expanded': open,
          'aria-controls': panelId,
          'aria-disabled': disabled || undefined,
          onClick: () => {
            if (!disabled) ctx.toggle(itemValue);
          },
        };

        const merged = mergeProps<'button'>(
          mergeProps<'button'>(defaultProps, otherProps),
          compositeProps as Record<string, unknown>,
        );

        return renderElement({
          defaultTagName: 'button',
          render,
          state,
          stateAttributesMapping: {
            open: (v: boolean): Record<string, string> | null =>
              v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' },
            disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          },
          props: merged,
        })!;
      }}
    >
      {children}
    </CompositeItem>
  );
}

// ---------------------------------------------------------------------------
// Accordion.Panel
// ---------------------------------------------------------------------------

export interface AccordionPanelProps extends ComponentProps<'div'> {}

function AccordionPanel(props: AccordionPanelProps) {
  const { render, ...otherProps } = props;
  const { open, triggerId, panelId } = useAccordionItemContext();

  const panelRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Track whether open has ever transitioned from true→false.
  // Until that happens, skip enter animations (prevents animate-on-load).
  const hasBeenClosed = useRef(false);
  if (!open) hasBeenClosed.current = true;

  const { mounted, transitionProps } = useTransition({
    open,
    ref: panelRef as RefObject<HTMLElement>,
  });

  // Measure the content height and keep it in sync via ResizeObserver
  useLayoutEffect(() => {
    if (!mounted) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Measure scrollHeight of the panel's content
    const measure = () => {
      setHeight(panel.scrollHeight);
    };

    measure();

    const ro = new ResizeObserver(measure);
    // Observe children mutations that affect height
    ro.observe(panel, { box: 'border-box' });

    return () => ro.disconnect();
  }, [mounted]);

  const state = { open };

  // Skip enter animation for panels that have never been closed
  const effectiveTransitionProps = !hasBeenClosed.current
    ? {
        ...transitionProps,
        'data-cl-starting-style': undefined,
        style: undefined,
      }
    : transitionProps;

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'accordion-panel',
    id: panelId,
    role: 'region' as const,
    'aria-labelledby': triggerId,
    ref: panelRef,
    ...effectiveTransitionProps,
    style: {
      '--cl-accordion-panel-height': height != null ? `${height}px` : undefined,
      ...effectiveTransitionProps.style,
    },
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
});
