import type { FormMessageProps as RadixFormMessageProps } from '@radix-ui/react-form';
import { FormMessage as RadixFormMessage } from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { isReactFragment } from '~/react/utils/is-react-fragment';

import { useFieldContext, useFieldFeedback } from './hooks';
import type { FormErrorProps } from './types';

const DISPLAY_NAME = 'ClerkElementsFieldError';

export type FormFieldErrorProps = FormErrorProps<RadixFormMessageProps & { name?: string }>;
type FormFieldErrorElement = React.ElementRef<typeof RadixFormMessage>;

/**
 * FieldError renders error messages associated with a specific field. By default, the error's message will be rendered in an unstyled `<span>`. Optionally, the `children` prop accepts a function to completely customize rendering.
 *
 * @param {string} [name] - Used to target a specific field by name when rendering outside of a `<Field>` component.
 * @param {Function} [children] - A function that receives `message` and `code` as arguments.
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.FieldError />
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.FieldError>
 *     {({ message, code }) => (
 *       <span data-error-code={code}>{message}</span>
 *     )}
 *   </Clerk.FieldError>
 * </Clerk.Field>
 */
export const FieldError = React.forwardRef<FormFieldErrorElement, FormFieldErrorProps>(
  ({ asChild = false, children, code, name, ...rest }, forwardedRef) => {
    const fieldContext = useFieldContext();
    const rawFieldName = fieldContext?.name || name;
    const fieldName = rawFieldName === 'backup_code' ? 'code' : rawFieldName;
    const { feedback } = useFieldFeedback({ name: fieldName });

    if (!(feedback?.type === 'error')) {
      return null;
    }

    const error = feedback.message;

    if (!error) {
      return null;
    }

    const Comp = asChild ? Slot : 'span';
    const child = typeof children === 'function' ? children(error) : children;

    // const forceMatch = code ? error.code === code : undefined; // TODO: Re-add when Radix Form is updated

    if (isReactFragment(child)) {
      throw new ClerkElementsRuntimeError('<FieldError /> cannot render a Fragment as a child.');
    }

    return (
      <RadixFormMessage
        data-error-code={error.code}
        // forceMatch={forceMatch}
        {...rest}
        ref={forwardedRef}
        asChild
      >
        <Comp>{child || error.message}</Comp>
      </RadixFormMessage>
    );
  },
);

FieldError.displayName = DISPLAY_NAME;
