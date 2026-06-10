'use client';

import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

export type DialogDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription(props, ref) {
    const { render, ...otherProps } = props;
    const { descriptionId } = useDialogContext();

    const defaultProps = {
      'data-cl-slot': 'dialog-description',
      id: descriptionId,
      ref,
    } as React.ComponentPropsWithRef<'p'>;

    return renderElement({
      defaultTagName: 'p',
      render,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
