import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Icon } from '../icon';
import { sizes as typographySizes, styles as typographyStyles } from '../typography.styles';
import { styles } from './field.styles';

function useNativeLabelWarning(label: HTMLLabelElement | null) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && label && label.tagName !== 'LABEL') {
      console.warn('[clerk] <Field.Label> must render a native `<label>` element.');
    }
  }, [label]);
}

/** Props for the field container. */
export type FieldRootProps = MosaicComponentProps<'div'>;

const Root = React.forwardRef<HTMLDivElement, FieldRootProps>(function MosaicFieldRoot(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('field-root'), className, style),
      ...rest,
    },
  });
});

/** Props for a native field label. */
export type FieldLabelProps = MosaicComponentProps<'label'>;

const Label = React.forwardRef<HTMLLabelElement, FieldLabelProps>(function MosaicFieldLabel(
  { render, className, style, ...rest },
  ref,
) {
  const [label, setLabel] = React.useState<HTMLLabelElement | null>(null);
  useNativeLabelWarning(label);
  return useRender({
    defaultTagName: 'label',
    render,
    ref: [ref, setLabel],
    props: {
      ...mergeStyleProps(
        themeProps('field-label'),
        stylex.props(typographyStyles.base, typographySizes.sm, styles.label),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Props for supporting field text. */
export type FieldDescriptionProps = MosaicComponentProps<'p'>;

const Description = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function MosaicFieldDescription(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-description'),
        stylex.props(typographyStyles.base, typographySizes.xs, styles.message, styles.description),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Props for field validation text. */
export type FieldErrorProps = MosaicComponentProps<'p'>;

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(function MosaicFieldError(
  { render, className, style, children, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-error'),
        stylex.props(typographyStyles.base, typographySizes.xs, styles.message, styles.error),
        className,
        style,
      ),
      ...rest,
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

/** Context-free styled parts for composing a field with explicit native semantics. */
export const Field = { Root, Label, Description, Error: FieldError };
