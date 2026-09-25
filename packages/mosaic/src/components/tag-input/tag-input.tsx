'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type {
  TagInputInputProps as PrimitiveTagInputInputProps,
  TagInputProps as PrimitiveTagInputProps,
} from '../../primitives/tag-input';
import { TagInput as Primitive } from '../../primitives/tag-input';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { inputStyles } from '../../utils/input.styles';
import { reset } from '../../utils/reset.styles';
import { useOptionalFieldControlProps } from '../field/field.context';
import { Icon } from '../icon';
import { styles } from './tag-input.styles';

type TagInputRootProps = Pick<
  PrimitiveTagInputProps,
  'value' | 'defaultValue' | 'onValueChange' | 'validate' | 'delimiters' | 'name' | 'form' | 'disabled'
>;

export interface TagInputProps
  extends
    Omit<MosaicComponentProps<'input'>, keyof TagInputRootProps | 'render' | 'children' | 'type'>,
    TagInputRootProps {
  removeLabel?: (value: string) => string;
}

const defaultRemoveLabel = (value: string) => `Remove ${value}`;

function Tags({ removeLabel }: { removeLabel: (value: string) => string }) {
  const { tags, disabled } = Primitive.useTagInput();

  return tags.map(tag => (
    <Primitive.Tag
      key={tag.value}
      value={tag.value}
      {...mergeStyleProps(
        themeProps('tag-input-tag', { invalid: tag.invalid, disabled }),
        stylex.props(reset.base, focusOutline.visible, styles.tag, tag.invalid && styles.tagInvalid),
      )}
    >
      <span {...mergeStyleProps(themeProps('tag-input-tag-label'), stylex.props(reset.base, styles.tagLabel))}>
        {tag.value}
      </span>
      <Primitive.TagRemove
        aria-label={removeLabel(tag.value)}
        {...mergeStyleProps(themeProps('tag-input-tag-remove'), stylex.props(reset.base, styles.tagRemove))}
      >
        <Icon
          name='x'
          size='sm'
        />
      </Primitive.TagRemove>
    </Primitive.Tag>
  ));
}

type TextInputProps = Omit<PrimitiveTagInputInputProps, 'className' | 'style'>;

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function MosaicTagInputText(
  { required, ...rest },
  ref,
) {
  const { value } = Primitive.useTagInput();

  return (
    <Primitive.Input
      ref={ref}
      required={required && value.length === 0}
      aria-required={required || undefined}
      {...mergeStyleProps(themeProps('tag-input-input'), stylex.props(reset.base, styles.input), rest)}
    />
  );
});

/**
 * A field that turns typed and pasted entries into removable tags. The ref points at the
 * text input, which is the control a `Field.Label` targets.
 */
export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(function MosaicTagInput(
  {
    value,
    defaultValue,
    onValueChange,
    validate,
    delimiters,
    name,
    form,
    removeLabel = defaultRemoveLabel,
    disabled: disabledProp,
    required: requiredProp,
    id,
    'aria-invalid': ariaInvalidProp,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    xstyle,
    ...inputProps
  },
  ref,
) {
  const fieldProps = useOptionalFieldControlProps({
    id,
    disabled: disabledProp,
    required: requiredProp,
    ariaInvalid: ariaInvalidProp,
    ariaLabelledBy,
    ariaDescribedBy,
  });
  const disabled = fieldProps?.disabled ?? disabledProp ?? false;
  const required = fieldProps?.required ?? requiredProp ?? false;
  const ariaInvalid = fieldProps?.['aria-invalid'] ?? ariaInvalidProp;
  const invalid = ariaInvalid === true || ariaInvalid === 'true';

  return (
    <Primitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      validate={validate}
      delimiters={delimiters}
      name={name}
      form={form}
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('tag-input', { disabled, invalid }),
        stylex.props(reset.base, inputStyles.group, styles.root, disabled && styles.disabled, xstyle),
      )}
    >
      <Primitive.List {...mergeStyleProps(themeProps('tag-input-list'), stylex.props(reset.base, styles.list))}>
        <Tags removeLabel={removeLabel} />
      </Primitive.List>
      <TextInput
        {...inputProps}
        ref={ref}
        id={fieldProps?.id ?? id}
        required={required}
        aria-invalid={ariaInvalid}
        aria-labelledby={fieldProps?.['aria-labelledby'] ?? ariaLabelledBy}
        aria-describedby={fieldProps?.['aria-describedby'] ?? ariaDescribedBy}
      />
    </Primitive.Root>
  );
});
