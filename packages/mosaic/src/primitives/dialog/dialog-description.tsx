'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogDescription}. */
export type DialogDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

/** Accessible dialog description. Wires its `id` to `aria-describedby` on `Dialog.Popup`. */
export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription(props, ref) {
    const { render, ...otherProps } = props;
    const { descriptionId } = useDialogContext();

    const defaultProps = {
      id: descriptionId,
    } satisfies DefaultProps<'p'>;

    return useRender({
      defaultTagName: 'p',
      render,
      ref,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
