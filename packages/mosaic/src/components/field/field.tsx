import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconName } from '../../icons/registry';
import { useTransition } from '../../primitives/hooks';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { sizes as typographySizes, styles as typographyStyles } from '../../utils/typography.styles';
import { visuallyHidden } from '../../utils/visually-hidden.styles';
import { Icon } from '../icon';
import {
  FieldMessageProvider,
  FieldProvider,
  useOptionalFieldContext,
  useRegisterFieldMessage,
  useRegisterFieldPartId,
} from './field.context';
import { dynamic, styles } from './field.styles';

function useNativeLabelWarning(label: HTMLElement | null) {
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
  { render, xstyle, disabled = false, required = false, invalid = false, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('field-root'), stylex.props(reset.base, styles.root, xstyle), rest),
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

function useMessageHeight(active: HTMLElement | null) {
  const [height, setHeight] = React.useState(0);

  useSafeLayoutEffect(() => {
    if (!active) {
      return undefined;
    }

    const measure = () => setHeight(active.offsetHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(active);
    return () => observer.disconnect();
  }, [active]);

  return height;
}

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
        stylex.props(reset.base, styles.messageRoot, dynamic.messageHeight(height), xstyle),
        { role: 'status', ...transitionProps },
        rest,
      ),
      children,
    },
  });

  return <FieldMessageProvider register={register}>{rendered}</FieldMessageProvider>;
});

type FieldFeedbackKind = 'error' | 'success';

const FEEDBACK: Record<FieldFeedbackKind, { slot: string; icon: IconName; color: stylex.StyleXStyles }> = {
  error: { slot: 'field-error', icon: 'exclamation-circle', color: styles.error },
  success: { slot: 'field-success', icon: 'checkmark', color: styles.success },
};

interface FieldFeedbackProps extends MosaicComponentProps<'p'> {
  kind: FieldFeedbackKind;
}

function hasMessage(children: React.ReactNode) {
  return React.Children.toArray(children).some(child => child !== '');
}

const FieldFeedback = React.forwardRef<HTMLParagraphElement, FieldFeedbackProps>(function MosaicFieldFeedback(
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
  const lastMessage = React.useRef(children);
  if (open) {
    lastMessage.current = children;
  }
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
        stylex.props(
          reset.base,
          typographyStyles.base,
          typographySizes.xs,
          styles.message,
          styles.feedback,
          color,
          xstyle,
        ),
        { 'aria-hidden': open ? undefined : true, ...transitionProps },
        rest,
      ),
      id,
      children: (
        <>
          <Icon
            name={icon}
            size='sm'
            aria-hidden='true'
            xstyle={styles.feedbackIcon}
          />
          <span>{lastMessage.current}</span>
        </>
      ),
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

/** Styled parts for composing an automatically associated single-control field. */
export const Field = { Root, Label, Description, Message, Error: FieldError, Success: FieldSuccess };
