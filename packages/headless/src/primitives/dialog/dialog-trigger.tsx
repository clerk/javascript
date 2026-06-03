'use client';

import { useDialogContext } from './dialog-context';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface DialogTriggerProps extends ComponentProps<'button'> {}

export function DialogTrigger(props: DialogTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useDialogContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-trigger',
    ref: refs.setReference,
    ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
