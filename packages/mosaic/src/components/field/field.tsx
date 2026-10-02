import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconName } from '../../icons/registry';
import { useTransition } from '../../primitives/hooks';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { feedbackHeight, feedbackStyles } from '../../styles/feedback.styles';
import { reset } from '../../styles/reset.styles';
import { sizes as typographySizes, styles as typographyStyles } from '../../styles/typography.styles';
import { visuallyHidden } from '../../styles/visually-hidden.styles';
import { FeedbackBody, hasMessage, useHeldMessage, useMessageHeight } from '../../utils/feedback';
import type { FieldFeedback as FormFieldFeedback } from '../form';
import type { FieldOrientation } from './field.context';
import {
  FieldMessageProvider,
  FieldProvider,
  useOptionalFieldContext,
  useRegisterFieldMessage,
  useRegisterFieldPartId,
} from './field.context';
import { styles } from './field.styles';

function useNativeLabelWarning(label: HTMLElement | null) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && label && label.tagName !== 'LABEL') {
      console.warn('[clerk] <Field.Label> must render a native `<label>` element.');
    }
  }, [label]);
}

/** Props for a field container that associates exactly one form control. */
export interface FieldRootProps extends MosaicComponentProps<'div'> {
  /** `horizontal` places the control beside a `Field.Content` that stacks the label and supporting text. */
  orientation?: FieldOrientation;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, FieldRootProps>(function MosaicFieldRoot(
  { render, xstyle, orientation = 'vertical', disabled = false, required = false, invalid = false, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('field-root', { orientation }),
        stylex.props(
          reset.base,
          styles.root,
          orientation === 'horizontal' && [typographySizes.sm, styles.horizontal],
          xstyle,
        ),
        rest,
      ),
    },
  });

  return (
    <FieldProvider
      orientation={orientation}
      disabled={disabled}
      required={required}
      invalid={invalid}
    >
      {element}
    </FieldProvider>
  );
});

/** Props for a native field label. */
export interface FieldLabelProps extends MosaicComponentProps<'label'> {
  /** Hide the label visually while keeping it in the accessibility tree. */
  visuallyHidden?: boolean;
}

const Label = React.forwardRef<HTMLElement, FieldLabelProps>(function MosaicFieldLabel(
  { render, xstyle, id: idProp, htmlFor: htmlForProp, visuallyHidden: isVisuallyHidden = false, onClick, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-field-${generatedId}-label` : undefined);
  // A `<label>` activates the control it names, which would open a select; those get a span
  // that only focuses it, and are named through `aria-labelledby` instead.
  const nativeLabel = htmlForProp !== undefined || context?.labelElementType !== 'span';
  const controlId = context?.controlId;
  const htmlFor = htmlForProp ?? (nativeLabel ? controlId : undefined);
  const [label, setLabel] = React.useState<HTMLElement | null>(null);
  useRegisterFieldPartId(htmlForProp === undefined ? id : undefined, context?.setLabelIds);
  useNativeLabelWarning(nativeLabel ? label : null);
  const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
    onClick?.(event);
    if (!nativeLabel && controlId && !event.defaultPrevented) {
      document.getElementById(controlId)?.focus();
    }
  };
  return useRender({
    defaultTagName: 'label',
    render: render ?? (nativeLabel ? undefined : <span />),
    ref: [ref, setLabel],
    props: {
      ...mergeStyleProps(
        themeProps('field-label', { visuallyHidden: isVisuallyHidden }),
        stylex.props(
          reset.base,
          typographyStyles.base,
          typographySizes.sm,
          styles.label,
          isVisuallyHidden && visuallyHidden.base,
          xstyle,
        ),
        rest,
      ),
      id,
      htmlFor,
      onClick: handleClick,
    },
  });
});

/** Props for the container that stacks a horizontal field's label and supporting text. */
export type FieldContentProps = MosaicComponentProps<'div'>;

const Content = React.forwardRef<HTMLDivElement, FieldContentProps>(function MosaicFieldContent(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('field-content'), stylex.props(reset.base, styles.content, xstyle), rest),
  });
});

/** Props for supporting field text. */
export type FieldDescriptionProps = MosaicComponentProps<'p'>;

const Description = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function MosaicFieldDescription(
  { render, xstyle, id: idProp, ...rest },
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
        stylex.props(reset.base, typographyStyles.base, typographySizes.xs, styles.message, styles.description, xstyle),
        rest,
      ),
      id,
    },
  });
});

/** Props for the container that animates field feedback height and crossfades its messages. */
export type FieldMessageProps = MosaicComponentProps<'div'>;

const Message = React.forwardRef<HTMLDivElement, FieldMessageProps>(function MosaicFieldMessage(
  { render, xstyle, children, ...rest },
  ref,
) {
  const entries = React.useRef(new Map<symbol, HTMLElement>());
  const [active, setActive] = React.useState<HTMLElement | null>(null);
  const register = React.useCallback((key: symbol, element: HTMLElement | null) => {
    if (element) {
      entries.current.set(key, element);
    } else {
      entries.current.delete(key);
    }
    setActive(entries.current.values().next().value ?? null);
  }, []);
  const height = useMessageHeight(active);
  const element = React.useRef<HTMLElement | null>(null);
  const { transitionProps } = useTransition({ open: active !== null, ref: element });
  const rendered = useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, element],
    props: {
      ...mergeStyleProps(
        themeProps('field-message'),
        stylex.props(reset.base, feedbackStyles.collapse, feedbackHeight.measured(height), xstyle),
        { role: 'status', ...transitionProps },
        rest,
      ),
      children,
    },
  });

  return <FieldMessageProvider register={register}>{rendered}</FieldMessageProvider>;
});

type FieldFeedbackKind = 'error' | 'success' | 'info';

const FEEDBACK: Record<FieldFeedbackKind, { slot: string; icon?: IconName; color: stylex.StyleXStyles }> = {
  error: { slot: 'field-error', icon: 'exclamation-circle', color: feedbackStyles.error },
  success: { slot: 'field-success', icon: 'checkmark', color: feedbackStyles.success },
  info: { slot: 'field-info', color: feedbackStyles.info },
};

interface FieldFeedbackPartProps extends MosaicComponentProps<'p'> {
  kind: FieldFeedbackKind;
}

const FieldFeedback = React.forwardRef<HTMLParagraphElement, FieldFeedbackPartProps>(function MosaicFieldFeedback(
  { render, xstyle, id: idProp, children, kind, ...rest },
  ref,
) {
  const { slot, icon, color } = FEEDBACK[kind];
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-field-${generatedId}-${kind}` : undefined);
  const open = hasMessage(children);
  const element = React.useRef<HTMLElement | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const message = useHeldMessage(children, open);
  useRegisterFieldPartId(open ? id : undefined, context?.setMessageIds);
  const registerMessage = useRegisterFieldMessage(open);
  return useRender({
    defaultTagName: 'p',
    render,
    enabled: mounted,
    ref: [ref, element, registerMessage],
    props: {
      ...mergeStyleProps(
        themeProps(slot),
        stylex.props(reset.base, typographyStyles.base, typographySizes.xs, feedbackStyles.message, color, xstyle),
        { 'aria-hidden': open ? undefined : true, ...transitionProps },
        rest,
      ),
      id,
      children: icon ? <FeedbackBody icon={icon}>{message}</FeedbackBody> : message,
    },
  });
});

/** Props for field validation text. */
export type FieldErrorProps = MosaicComponentProps<'p'>;

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(function MosaicFieldError(props, ref) {
  return (
    <FieldFeedback
      ref={ref}
      kind='error'
      {...props}
    />
  );
});

/** Props for field success text. */
export type FieldSuccessProps = MosaicComponentProps<'p'>;

const FieldSuccess = React.forwardRef<HTMLParagraphElement, FieldSuccessProps>(function MosaicFieldSuccess(props, ref) {
  return (
    <FieldFeedback
      ref={ref}
      kind='success'
      {...props}
    />
  );
});

export type FieldHintProps = MosaicComponentProps<'p'>;

const FieldHint = React.forwardRef<HTMLParagraphElement, FieldHintProps>(function MosaicFieldHint(props, ref) {
  return (
    <FieldFeedback
      ref={ref}
      kind='info'
      {...props}
    />
  );
});

export interface FieldFeedbackProps extends Omit<FieldMessageProps, 'children'> {
  feedback?: FormFieldFeedback;
}

const Feedback = React.forwardRef<HTMLDivElement, FieldFeedbackProps>(function MosaicFieldFeedbackValue(
  { feedback, ...props },
  ref,
) {
  return (
    <Message
      ref={ref}
      {...props}
    >
      <FieldError>{feedback?.type === 'error' ? feedback.message : null}</FieldError>
      <FieldHint>{feedback?.type === 'info' || feedback?.type === 'warning' ? feedback.message : null}</FieldHint>
      <FieldSuccess>{feedback?.type === 'success' ? feedback.message : null}</FieldSuccess>
    </Message>
  );
});

/** Styled parts for composing an automatically associated single-control field. */
export const Field = {
  Root,
  Label,
  Content,
  Description,
  Message,
  Feedback,
  Error: FieldError,
  Success: FieldSuccess,
  Hint: FieldHint,
};
