'use client';

import { useId, useLayoutEffect } from 'react';
import { useDialogContext } from './dialog-context';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface DialogTitleProps extends ComponentProps<'h2'> {}

export function DialogTitle(props: DialogTitleProps) {
  const { render, ...otherProps } = props;
  const { setLabelId } = useDialogContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  const defaultProps = {
    'data-cl-slot': 'dialog-title',
    id,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}
