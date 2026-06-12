'use client';

import { type ReactNode, useId, useMemo } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { CollapsibleContext, type CollapsibleContextValue } from './collapsible-context';

export interface CollapsibleProps extends ComponentProps<'div'> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the collapsible. @default false */
  disabled?: boolean;
  children: ReactNode;
}

export function CollapsibleRoot(props: CollapsibleProps) {
  const { render, open: openProp, defaultOpen, onOpenChange, disabled = false, children, ...otherProps } = props;

  const [open, setOpen] = useControllableState(openProp, defaultOpen ?? false, onOpenChange);

  const rootId = useId();
  const triggerId = `${rootId}trigger`;
  const panelId = `${rootId}panel`;

  const contextValue = useMemo<CollapsibleContextValue>(
    () => ({ open, setOpen, disabled, triggerId, panelId }),
    [open, setOpen, disabled, triggerId, panelId],
  );

  const state = { open, disabled };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'collapsible-root',
    children,
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
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
    </CollapsibleContext.Provider>
  );
}
