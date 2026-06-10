'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useDialogContext } from './dialog-context';

export type DialogTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

export function DialogTitle(props: DialogTitleProps) {
  const { render, ...otherProps } = props;
  const { labelId } = useDialogContext();

  const defaultProps = {
    'data-cl-slot': 'dialog-title',
    id: labelId,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}
