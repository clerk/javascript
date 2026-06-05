'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useCollapsibleContext } from './collapsible-context';

export interface CollapsibleTriggerProps extends ComponentProps<'button'> {}

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, setOpen, disabled, triggerId, panelId } = useCollapsibleContext();

  const state = { open, disabled };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'collapsible-trigger',
    id: triggerId,
    type: 'button' as const,
    'aria-expanded': open,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
    onClick: () => {
      if (!disabled) setOpen(!open);
    },
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
