'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useDialogContext } from './dialog-context';

export type DialogDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

export function DialogDescription(props: DialogDescriptionProps) {
  const { render, ...otherProps } = props;
  const { descriptionId } = useDialogContext();

  const defaultProps = {
    'data-cl-slot': 'dialog-description',
    id: descriptionId,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}
