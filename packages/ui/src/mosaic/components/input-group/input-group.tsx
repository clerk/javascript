'use client';

import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { Button, type ButtonProps } from '../button';
import { ButtonContext } from '../button/button.context';
import { useOptionalFieldContext } from '../field/field.context';
import type { InputGroupSize } from './input-group.context';
import { InputGroupContext, useInputGroupContext } from './input-group.context';
import { compactActionInsets, sizes, styles, textSizes } from './input-group.styles';

export interface InputGroupRootProps extends MosaicComponentProps<'div'> {
  disabled?: boolean;
  invalid?: boolean;
  size?: InputGroupSize;
}

const Root = React.forwardRef<HTMLDivElement, InputGroupRootProps>(function MosaicInputGroupRoot(
  { render, className, style, disabled: disabledProp, invalid: invalidProp, size = 'md', ...otherProps },
  ref,
) {
  const field = useOptionalFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const inputElementRef = React.useRef<HTMLInputElement | null>(null);
  const focusInput = React.useCallback(() => inputElementRef.current?.focus(), []);
  const inputRef = React.useCallback((node: HTMLInputElement | null) => {
    inputElementRef.current = node;
  }, []);
  const context = React.useMemo(
    () => ({ disabled, focusInput, invalid, inputRef, size }),
    [disabled, focusInput, invalid, inputRef, size],
  );
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('input-group', { size, disabled, invalid }),
        stylex.props(reset.base, inputStyles.group, styles.root, sizes[size], disabled && inputStyles.disabled),
        className,
        style,
      ),
      ...otherProps,
    },
  });

  return <InputGroupContext.Provider value={context}>{element}</InputGroupContext.Provider>;
});

export type InputGroupTextProps = MosaicComponentProps<'span'>;

const Text = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(function MosaicInputGroupText(
  { render, className, style, onPointerDown, ...otherProps },
  ref,
) {
  const group = useInputGroupContext();

  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('input-group-text', { size: group.size, disabled: group.disabled }),
        stylex.props(reset.base, styles.text, textSizes[group.size]),
        className,
        style,
      ),
      onPointerDown: (event: React.PointerEvent<HTMLSpanElement>) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          group.focusInput();
        }
      },
      ...otherProps,
    },
  });
});

export type InputGroupActionProps = ButtonProps;

const Action = React.forwardRef<HTMLButtonElement, InputGroupActionProps>(function MosaicInputGroupAction(
  { color = 'neutral', variant = 'ghost', size: sizeProp, disabled: disabledProp, className, style, ...otherProps },
  ref,
) {
  const group = useInputGroupContext();
  const disabled = group.disabled || disabledProp || false;
  const size = sizeProp ?? group.size;

  return (
    <Button
      ref={ref}
      color={color}
      variant={variant}
      size={size}
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('input-group-action', { size, disabled }),
        stylex.props(size === 'xs' && compactActionInsets[group.size]),
        className,
        style,
      )}
      {...otherProps}
    />
  );
});

export type InputGroupAddonProps = MosaicComponentProps<'span'>;

function useAddon(
  side: 'start' | 'end',
  { render, className, style, ...props }: InputGroupAddonProps,
  ref: React.ForwardedRef<HTMLSpanElement>,
) {
  const group = useInputGroupContext();
  const defaults = React.useMemo(
    () => ({ size: 'sm', shape: 'square', color: 'neutral', variant: 'ghost', disabled: group.disabled }) as const,
    [group.disabled],
  );
  const element = useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps(`input-group-${side}`),
        stylex.props(reset.base, styles.addon, styles[side]),
        className,
        style,
      ),
      ...props,
    },
  });
  return <ButtonContext.Provider value={defaults}>{element}</ButtonContext.Provider>;
}

const Start = React.forwardRef<HTMLSpanElement, InputGroupAddonProps>(function MosaicInputGroupStart(props, ref) {
  return useAddon('start', props, ref);
});

const End = React.forwardRef<HTMLSpanElement, InputGroupAddonProps>(function MosaicInputGroupEnd(props, ref) {
  return useAddon('end', props, ref);
});

export const InputGroup = { Root, Text, Action, Start, End };
