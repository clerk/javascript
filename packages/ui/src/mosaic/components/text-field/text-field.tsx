import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Icon } from '../icon';
import { Input, type InputProps } from '../input';
import { horizontalLabelSizes, labelSizes, layouts, messageSizes, styles } from './text-field.styles';

export type TextFieldLayout = 'stacked' | 'horizontal';
export type TextFieldSize = NonNullable<InputProps['size']>;

export interface TextFieldIds {
  control?: string;
  label?: string;
  description?: string;
  error?: string;
}

interface TextFieldContextValue {
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  layout: TextFieldLayout;
  size: TextFieldSize;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
}

const TextFieldContext = React.createContext<TextFieldContextValue | null>(null);

function useTextFieldContext(part: string): TextFieldContextValue {
  const context = React.useContext(TextFieldContext);
  if (!context) {
    throw new Error(`<TextField.${part}> must be rendered inside <TextField.Root>.`);
  }
  return context;
}

function mergeIds(...values: Array<string | undefined>): string | undefined {
  const ids = Array.from(new Set(values.flatMap(value => value?.split(/\s+/).filter(Boolean) ?? [])));
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function useTextFieldControlProps(ariaDescribedBy?: string) {
  const context = useTextFieldContext('Input');
  const { controlId, descriptionId, errorId, size, invalid, disabled, required } = context;
  return {
    context,
    controlProps: {
      id: controlId,
      size,
      disabled,
      required,
      'aria-invalid': invalid ? ('true' as const) : undefined,
      'aria-describedby': mergeIds(ariaDescribedBy, descriptionId, invalid ? errorId : undefined),
    },
  };
}

export interface TextFieldRootProps extends MosaicComponentProps<'div'> {
  /** Arrangement of the label and control content. @default 'stacked' */
  layout?: TextFieldLayout;
  /** Size shared by the label, input, and messages. @default 'md' */
  size?: TextFieldSize;
  /** Marks the field as invalid without performing validation. */
  invalid?: boolean;
  /** Disables the field input and dims supporting text. */
  disabled?: boolean;
  /** Marks the field input as required. */
  required?: boolean;
  /** Stable IDs for integrating with markup outside the compound component. */
  ids?: TextFieldIds;
}

const Root = React.forwardRef<HTMLDivElement, TextFieldRootProps>(function MosaicTextFieldRoot(
  {
    layout = 'stacked',
    size = 'md',
    invalid = false,
    disabled = false,
    required = false,
    ids,
    render,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const controlId = ids?.control ?? `cl-text-field-${generatedId}`;
  const context: TextFieldContextValue = {
    controlId,
    labelId: ids?.label ?? `${controlId}-label`,
    descriptionId: ids?.description ?? `${controlId}-description`,
    errorId: ids?.error ?? `${controlId}-error`,
    layout,
    size,
    invalid,
    disabled,
    required,
  };

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('text-field-root', { layout, size, invalid, disabled, required }),
        stylex.props(styles.root, layouts[layout]),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <TextFieldContext.Provider value={context}>{element}</TextFieldContext.Provider>;
});

export type TextFieldLabelProps = Omit<MosaicComponentProps<'label'>, 'id' | 'htmlFor'>;

const Label = React.forwardRef<HTMLLabelElement, TextFieldLabelProps>(function MosaicTextFieldLabel(
  { render, className, style, ...rest },
  ref,
) {
  const { controlId, labelId, layout, size, invalid, disabled, required } = useTextFieldContext('Label');
  return useRender({
    defaultTagName: 'label',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('text-field-label', { layout, size, invalid, disabled, required }),
        stylex.props(
          styles.label,
          labelSizes[size],
          layout === 'horizontal' && horizontalLabelSizes[size],
          disabled && styles.disabledText,
        ),
        className,
        style,
      ),
      ...rest,
      htmlFor: controlId,
      id: labelId,
    },
  });
});

export type TextFieldContentProps = MosaicComponentProps<'div'>;

const Content = React.forwardRef<HTMLDivElement, TextFieldContentProps>(function MosaicTextFieldContent(
  { render, className, style, ...rest },
  ref,
) {
  const { layout, size, invalid, disabled, required } = useTextFieldContext('Content');
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('text-field-content', { layout, size, invalid, disabled, required }),
        stylex.props(styles.content),
        className,
        style,
      ),
      ...rest,
    },
  });
});

export type TextFieldInputProps = Omit<
  InputProps,
  'id' | 'size' | 'disabled' | 'required' | 'aria-disabled' | 'aria-required' | 'aria-invalid'
>;

const FieldInput = React.forwardRef<HTMLInputElement, TextFieldInputProps>(function MosaicTextFieldInput(
  { render, className, style, 'aria-describedby': ariaDescribedBy, ...rest },
  ref,
) {
  const { context, controlProps } = useTextFieldControlProps(ariaDescribedBy);
  const { layout, size, invalid, disabled, required } = context;
  return (
    <Input
      ref={ref}
      render={render}
      {...mergeStyleProps(
        themeProps('text-field-input', { layout, size, invalid, disabled, required }),
        className,
        style,
      )}
      {...rest}
      {...controlProps}
    />
  );
});

export type TextFieldDescriptionProps = Omit<MosaicComponentProps<'p'>, 'id'>;

const Description = React.forwardRef<HTMLParagraphElement, TextFieldDescriptionProps>(
  function MosaicTextFieldDescription({ render, className, style, ...rest }, ref) {
    const { descriptionId, layout, size, invalid, disabled, required } = useTextFieldContext('Description');
    return useRender({
      defaultTagName: 'p',
      render,
      ref,
      props: {
        ...mergeStyleProps(
          themeProps('text-field-description', { layout, size, invalid, disabled, required }),
          stylex.props(styles.message, styles.description, messageSizes[size], disabled && styles.disabledText),
          className,
          style,
        ),
        ...rest,
        id: descriptionId,
      },
    });
  },
);

export type TextFieldErrorProps = Omit<MosaicComponentProps<'p'>, 'id'>;

const FieldError = React.forwardRef<HTMLParagraphElement, TextFieldErrorProps>(function MosaicTextFieldError(
  { render, className, style, children, ...rest },
  ref,
) {
  const { errorId, layout, size, invalid, disabled, required } = useTextFieldContext('Error');
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('text-field-error', { layout, size, invalid, disabled, required }),
        stylex.props(styles.message, styles.error, messageSizes[size], disabled && styles.disabledText),
        className,
        style,
      ),
      ...rest,
      id: errorId,
      children: (
        <>
          <Icon
            name='alert-circle'
            size='sm'
            aria-hidden='true'
            {...stylex.props(styles.errorIcon)}
          />
          <span>{children}</span>
        </>
      ),
    },
  });
});

/**
 * A semantic field composition that wires a label and supporting messages to Mosaic `Input`.
 * It provides layout and shared state, but deliberately does not manage values or validation.
 */
export const TextField = { Root, Label, Content, Input: FieldInput, Description, Error: FieldError };
