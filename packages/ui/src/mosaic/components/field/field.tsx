import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Icon } from '../icon';
import { sizes as typographySizes, styles as typographyStyles } from '../typography.styles';
import { styles } from './field.styles';

interface FieldContextValue {
  controlId: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  labelIds: string[];
  descriptionIds: string[];
  errorIds: string[];
  setLabelIds: React.Dispatch<React.SetStateAction<string[]>>;
  setDescriptionIds: React.Dispatch<React.SetStateAction<string[]>>;
  setErrorIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext(part: string): FieldContextValue {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error(`<Field.${part}> must be rendered inside <Field.Root>.`);
  }
  return context;
}

function mergeIdRefs(...values: Array<string | undefined>): string | undefined {
  const ids = Array.from(new Set(values.flatMap(value => value?.split(/\s+/).filter(Boolean) ?? [])));
  return ids.length > 0 ? ids.join(' ') : undefined;
}

interface FieldControlSemanticsProps {
  disabled?: boolean;
  required?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: React.AriaAttributes['aria-invalid'];
  ariaDisabled?: React.AriaAttributes['aria-disabled'];
  ariaRequired?: React.AriaAttributes['aria-required'];
}

function getFieldControlSemantics(context: FieldContextValue, props: FieldControlSemanticsProps) {
  const disabled = Boolean(context.disabled || props.disabled);
  const required = Boolean(context.required || props.required);
  const invalid = context.invalid || props.ariaInvalid === true || props.ariaInvalid === 'true';

  return {
    state: { invalid, disabled, required },
    props: {
      id: context.controlId,
      disabled,
      required,
      'aria-labelledby': mergeIdRefs(props.ariaLabelledBy, ...context.labelIds),
      'aria-invalid': invalid ? ('true' as const) : props.ariaInvalid,
      'aria-disabled': disabled ? ('true' as const) : props.ariaDisabled,
      'aria-required': required ? ('true' as const) : props.ariaRequired,
      'aria-describedby': mergeIdRefs(
        props.ariaDescribedBy,
        ...context.descriptionIds,
        ...(invalid ? context.errorIds : []),
      ),
    },
  };
}

export function useOptionalFieldControlSemantics(props: FieldControlSemanticsProps) {
  const context = React.useContext(FieldContext);
  return context ? getFieldControlSemantics(context, props) : null;
}

function useRegisterFieldPartId(id: string, setIds: React.Dispatch<React.SetStateAction<string[]>>) {
  React.useEffect(() => {
    setIds(ids => (ids.includes(id) ? ids : [...ids, id]));
    return () => setIds(ids => ids.filter(value => value !== id));
  }, [id, setIds]);
}

function useNativeLabelWarning(label: HTMLLabelElement | null) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && label && label.tagName !== 'LABEL') {
      console.warn('[clerk] <Field.Label> must render a native `<label>` element.');
    }
  }, [label]);
}

/** Props for the semantic container that shares field state with its composed parts. */
export interface FieldRootProps extends MosaicComponentProps<'div'> {
  /** Marks the field as invalid without performing validation. @default false */
  invalid?: boolean;
  /** Disables the field control and dims supporting text. @default false */
  disabled?: boolean;
  /** Marks the field control as required. @default false */
  required?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, FieldRootProps>(function MosaicFieldRoot(
  { invalid = false, disabled = false, required = false, render, className, style, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const controlId = `cl-field-${generatedId}`;
  const [labelIds, setLabelIds] = React.useState<string[]>([]);
  const [descriptionIds, setDescriptionIds] = React.useState<string[]>([]);
  const [errorIds, setErrorIds] = React.useState<string[]>([]);
  const context = React.useMemo<FieldContextValue>(
    () => ({
      controlId,
      invalid,
      disabled,
      required,
      labelIds,
      descriptionIds,
      errorIds,
      setLabelIds,
      setDescriptionIds,
      setErrorIds,
    }),
    [controlId, invalid, disabled, required, labelIds, descriptionIds, errorIds],
  );

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('field-root', { invalid, disabled, required }), className, style),
      ...rest,
    },
  });

  return <FieldContext.Provider value={context}>{element}</FieldContext.Provider>;
});

/** Props for the native label associated with the registered field control. The element must remain a `<label>`. */
export type FieldLabelProps = Omit<MosaicComponentProps<'label'>, 'id' | 'htmlFor'>;

const Label = React.forwardRef<HTMLLabelElement, FieldLabelProps>(function MosaicFieldLabel(
  { render, className, style, ...rest },
  ref,
) {
  const { controlId, invalid, disabled, required, setLabelIds } = useFieldContext('Label');
  const generatedId = React.useId();
  const labelId = `cl-field-${generatedId}-label`;
  const [label, setLabel] = React.useState<HTMLLabelElement | null>(null);
  useRegisterFieldPartId(labelId, setLabelIds);
  useNativeLabelWarning(label);
  return useRender({
    defaultTagName: 'label',
    render,
    ref: [ref, setLabel],
    props: {
      ...mergeStyleProps(
        themeProps('field-label', { invalid, disabled, required }),
        stylex.props(typographyStyles.base, typographySizes.sm, styles.label, disabled && styles.disabledText),
        className,
        style,
      ),
      ...rest,
      htmlFor: controlId,
      id: labelId,
    },
  });
});

/** Props for supporting text that describes the field control. */
export type FieldDescriptionProps = Omit<MosaicComponentProps<'p'>, 'id'>;

const Description = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function MosaicFieldDescription(
  { render, className, style, ...rest },
  ref,
) {
  const { invalid, disabled, required, setDescriptionIds } = useFieldContext('Description');
  const generatedId = React.useId();
  const descriptionId = `cl-field-${generatedId}-description`;
  useRegisterFieldPartId(descriptionId, setDescriptionIds);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-description', { invalid, disabled, required }),
        stylex.props(
          typographyStyles.base,
          typographySizes.xs,
          styles.message,
          styles.description,
          disabled && styles.disabledText,
        ),
        className,
        style,
      ),
      ...rest,
      id: descriptionId,
    },
  });
});

/** Props for validation text associated with an invalid field control. */
export type FieldErrorProps = Omit<MosaicComponentProps<'p'>, 'id'>;

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(function MosaicFieldError(
  { render, className, style, children, ...rest },
  ref,
) {
  const { invalid, disabled, required, setErrorIds } = useFieldContext('Error');
  const generatedId = React.useId();
  const errorId = `cl-field-${generatedId}-error`;
  useRegisterFieldPartId(errorId, setErrorIds);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-error', { invalid, disabled, required }),
        stylex.props(
          typographyStyles.base,
          typographySizes.xs,
          styles.message,
          styles.error,
          disabled && styles.disabledText,
        ),
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

/** Accessible field semantics without assumptions about the surrounding layout or rendered control. */
export const Field = { Root, Label, Description, Error: FieldError };
