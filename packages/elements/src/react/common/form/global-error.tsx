import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { isReactFragment } from '~/react/utils/is-react-fragment';

import { useGlobalErrors } from './hooks';
import type { FormErrorProps } from './types';

const DISPLAY_NAME = 'ClerkElementsGlobalError';

type FormGlobalErrorElement = React.ElementRef<'div'>;
export type FormGlobalErrorProps = FormErrorProps<React.ComponentPropsWithoutRef<'div'>>;

/**
 * Used to render errors that are returned from Clerk's API, but that are not associated with a specific form field. By default, will render the error's message wrapped in a `<div>`. Optionally, the `children` prop accepts a function to completely customize rendering. Must be placed **inside** components like `<SignIn>`/`<SignUp>` to have access to the underlying form state.
 *
 * @param {string} [code] - Forces the message with the matching code to be shown. This is useful when using server-side validation.
 * @param {Function} [children] - A function that receives `message` and `code` as arguments.
 * @param {boolean} [asChild] - If `true`, `<GlobalError>` will render as its child element, passing along any necessary props.
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError />
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError code="user_locked">Your custom error message.</Clerk.GlobalError>
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.GlobalError>
 *     {({ message, code }) => (
 *       <span data-error-code={code}>{message}</span>
 *     )}
 *   </Clerk.GlobalError>
 * </SignIn.Root>
 */
export const GlobalError = React.forwardRef<FormGlobalErrorElement, FormGlobalErrorProps>(
  ({ asChild = false, children, code, ...rest }, forwardedRef) => {
    const { errors } = useGlobalErrors();

    const error = errors?.[0];

    if (!error || (code && error.code !== code)) {
      return null;
    }

    const Comp = asChild ? Slot : 'div';
    const child = typeof children === 'function' ? children(error) : children;

    if (isReactFragment(child)) {
      throw new ClerkElementsRuntimeError('<GlobalError /> cannot render a Fragment as a child.');
    }

    return (
      <Comp
        role='alert'
        {...rest}
        ref={forwardedRef}
      >
        {child || error.message}
      </Comp>
    );
  },
);

GlobalError.displayName = DISPLAY_NAME;
