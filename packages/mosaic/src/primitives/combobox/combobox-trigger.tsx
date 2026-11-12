'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { Button } from '../button';
import { type ComponentProps, type DefaultProps, mergeProps } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxTriggerProps = ComponentProps<'button'>;

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  function ComboboxTrigger(props, ref) {
    const { render, disabled: disabledProp, ...otherProps } = props;
    const {
      open,
      setOpen,
      focusInput,
      popupId,
      triggerRef,
      disabled: rootDisabled,
      focusableWhenDisabled,
    } = useComboboxContext();
    const disabled = disabledProp === true || rootDisabled;
    const mergedRef = useMergeRefs([triggerRef, ref]);

    const defaultProps = {
      tabIndex: -1,
      'aria-controls': popupId,
      'aria-expanded': open,
      'aria-haspopup': 'listbox',
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        setOpen(!open);
        focusInput();
      },
    } satisfies DefaultProps<'button'>;

    return (
      <Button
        ref={mergedRef}
        render={render}
        disabled={disabled}
        focusableWhenDisabled={focusableWhenDisabled}
        data-open={open ? '' : undefined}
        data-closed={open ? undefined : ''}
        {...mergeProps<'button'>(defaultProps, otherProps)}
      />
    );
  },
);
