import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Icon } from '../icon';
import { reset } from '../reset.styles';
import { sizes as typographySizes, styles as typographyStyles } from '../typography.styles';
import { FieldProvider, useOptionalFieldContext, useRegisterFieldPartId } from './field.context';
import { styles } from './field.styles';

function useNativeLabelWarning(label: HTMLLabelElement | null) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && label && label.tagName !== 'LABEL') {
      console.warn('[clerk] <Field.Label> must render a native `<label>` element.');
    }
  }, [label]);
}

/** Props for a field container that associates exactly one form control. */
export interface FieldRootProps extends MosaicComponentProps<'div'> {
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, FieldRootProps>(function MosaicFieldRoot(
  { render, className, style, disabled = false, required = false, invalid = false, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('field-root'), stylex.props(reset.base), className, style),
      ...rest,
    },
  });

  return (
    <FieldProvider
      disabled={disabled}
      required={required}
      invalid={invalid}
    >
      {element}
    </FieldProvider>
  );
});

/** Props for a native field label. */
export type FieldLabelProps = MosaicComponentProps<'label'>;

const Label = React.forwardRef<HTMLLabelElement, FieldLabelProps>(function MosaicFieldLabel(
  { render, className, style, id: idProp, htmlFor: htmlForProp, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-field-${generatedId}-label` : undefined);
  const htmlFor = htmlForProp ?? context?.controlId;
  const [label, setLabel] = React.useState<HTMLLabelElement | null>(null);
  useRegisterFieldPartId(htmlForProp === undefined ? id : undefined, context?.setLabelIds);
  useNativeLabelWarning(label);
  return useRender({
    defaultTagName: 'label',
    render,
    ref: [ref, setLabel],
    props: {
      ...mergeStyleProps(
        themeProps('field-label'),
        stylex.props(reset.base, typographyStyles.base, typographySizes.sm, styles.label),
        className,
        style,
      ),
      ...rest,
      id,
      htmlFor,
    },
  });
});

/** Props for supporting field text. */
export type FieldDescriptionProps = MosaicComponentProps<'p'>;

const Description = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function MosaicFieldDescription(
  { render, className, style, id: idProp, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-field-${generatedId}-description` : undefined);
  useRegisterFieldPartId(id, context?.setMessageIds);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-description'),
        stylex.props(reset.base, typographyStyles.base, typographySizes.xs, styles.message, styles.description),
        className,
        style,
      ),
      ...rest,
      id,
    },
  });
});

/** Props for field validation text. */
export type FieldErrorProps = MosaicComponentProps<'p'>;

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(function MosaicFieldError(
  { render, className, style, id: idProp, children, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-field-${generatedId}-error` : undefined);
  useRegisterFieldPartId(id, context?.setMessageIds);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-error'),
        stylex.props(reset.base, typographyStyles.base, typographySizes.xs, styles.message, styles.error),
        className,
        style,
      ),
      ...rest,
      id,
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

/** Styled parts for composing an automatically associated single-control field. */
export const Field = { Root, Label, Description, Error: FieldError };
