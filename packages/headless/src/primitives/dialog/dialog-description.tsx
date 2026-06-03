'use client';

import { useId, useLayoutEffect } from 'react';
import { useDialogContext } from './dialog-context';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface DialogDescriptionProps extends ComponentProps<'p'> {}

export function DialogDescription(props: DialogDescriptionProps) {
  const { render, ...otherProps } = props;
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  const defaultProps = {
    'data-cl-slot': 'dialog-description',
    id,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}
