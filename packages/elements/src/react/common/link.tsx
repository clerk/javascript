import { useClerk } from '@clerk/shared/react';
import { useClerkRouter } from '@clerk/shared/router';
import type { ClerkOptions } from '@clerk/shared/types';
import React from 'react';

type Destination = 'sign-in' | 'sign-up';
export interface LinkProps extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'children'> {
  navigate: Destination;
  children: React.ReactNode | ((props: { url: string }) => React.ReactNode);
}

const paths: Record<Destination, keyof Pick<ClerkOptions, 'signInUrl' | 'signUpUrl'>> = {
  'sign-in': 'signInUrl',
  'sign-up': 'signUpUrl',
};

/**
 * The `<Link>` component is used to navigate between sign-in and sign-up flows.
 *
 * @param {Destination} navigate - The destination to navigate to.
 *
 * @example
 * ```tsx
 * <Link navigate="sign-in">Sign in</Link>
 * ```
 * @example
 * ```tsx
 * <Link navigate="sign-in">
 *  {({ url }) => (
 *    <NextLink href={url}>Sign in</NextLink>
 *  )}
 * </Link>
 */

export function Link({ navigate, children, ...rest }: LinkProps) {
  const router = useClerkRouter();
  const clerk = useClerk();
  const destinationUrl = router.makeDestinationUrlWithPreservedQueryParameters(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clerk.__internal_getOption(paths[navigate])!,
  );

  if (typeof children === 'function') {
    return children({ url: destinationUrl });
  }

  return (
    <a
      onClick={e => {
        if (router) {
          e.preventDefault();
          router.push(destinationUrl);
        }
      }}
      href={destinationUrl}
      {...rest}
    >
      {children}
    </a>
  );
}
