'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useDialogContext } from './dialog-context';

export type DialogTriggerProps = ComponentProps<'button'>;

export function DialogTrigger(props: DialogTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useDialogContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-trigger',
    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
