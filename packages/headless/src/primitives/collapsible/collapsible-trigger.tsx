'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useCollapsibleContext } from './collapsible-context';

export type CollapsibleTriggerProps = ComponentProps<'button'>;

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, setOpen, disabled, triggerId, panelId } = useCollapsibleContext();

  const state = { open, disabled };

  const defaultProps: Record<string, unknown> = {
    id: triggerId,
    type: 'button' as const,
    'aria-expanded': open,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
    onClick: () => {
      if (!disabled) {
        setOpen(!open);
      }
    },
  };

  const merged = mergeProps<'button'>(defaultProps, otherProps);
  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the trigger/panel aria pairing would silently break.
  merged.id = triggerId;

  return useRender({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: merged,
  });
}
