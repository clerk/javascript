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
import { Input } from '../input';
import type { InputGroupSize } from './input-group.context';
import { InputGroupContext, useInputGroupContext } from './input-group.context';
import { compactActionInsets, sizes, styles, textSizes } from './input-group.styles';

export interface InputGroupRootProps extends MosaicComponentProps<'div'> {
  disabled?: boolean;
  invalid?: boolean;
  size?: InputGroupSize;
}

const Root = React.forwardRef<HTMLDivElement, InputGroupRootProps>(function MosaicInputGroupRoot(
  { render, className, style, onClick, disabled: disabledProp, invalid: invalidProp, size = 'md', ...otherProps },
  ref,
) {
  const field = useOptionalFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const inputElementRef = React.useRef<HTMLInputElement | null>(null);
  const inputRef = React.useCallback((node: HTMLInputElement | null) => {
    inputElementRef.current = node;
  }, []);
  const context = React.useMemo(() => ({ disabled, invalid, inputRef, size }), [disabled, invalid, inputRef, size]);
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
      onClick: (event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled || !(event.target instanceof Element)) {
          return;
        }
        const interactive = event.target.closest(
          'button, input, select, textarea, a[href], label, summary, [tabindex], [role], [contenteditable]:not([contenteditable="false"])',
        );
        if (
          !event.currentTarget.contains(event.target) ||
          (interactive && interactive !== event.currentTarget && event.currentTarget.contains(interactive))
        ) {
          return;
        }
        inputElementRef.current?.focus();
      },
    },
  });

  return <InputGroupContext.Provider value={context}>{element}</InputGroupContext.Provider>;
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

const addonButtonSizes = { sm: 'xs', md: 'sm', lg: 'md' } as const;

function useAddon(
  side: 'start' | 'end',
  { render, className, style, ...props }: InputGroupAddonProps,
  ref: React.ForwardedRef<HTMLSpanElement>,
) {
  const group = useInputGroupContext();
  const defaults = React.useMemo(
    () =>
      ({
        size: addonButtonSizes[group.size],
        shape: 'square',
        color: 'neutral',
        variant: 'ghost',
        disabled: group.disabled,
        styles: styles.button,
        sizeStyles: styles.buttonSize,
        iconStyles: styles.iconButton,
      }) as const,
    [group.disabled, group.size],
  );
  const element = useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps(`input-group-${side}`, { size: group.size, disabled: group.disabled }),
        stylex.props(reset.base, styles.addon, textSizes[group.size], styles[side]),
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

export const InputGroup = { Root, Input, Action, Start, End };
