import { useClerk } from '@clerk/shared/react';
import { useClerkRouter } from '@clerk/shared/router';
import type { ClerkOptions } from '@clerk/types';
import React from 'react';

type Destination = 'sign-in' | 'sign-up';
export interface LinkProps extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'children'> {
  navigate: Destination;
  children: React.ReactNode | ((url: string) => React.ReactNode);
}

const paths: Record<Destination, keyof Pick<ClerkOptions, 'signInUrl' | 'signUpUrl'>> = {
  'sign-in': 'signInUrl',
  'sign-up': 'signUpUrl',
};

export function Link({ navigate, children, ...rest }: LinkProps) {
  const router = useClerkRouter();
  const clerk = useClerk();
  const destinationUrl = router.makeDestinationUrlWithPreservedQueryParameters(
    clerk.__internal_getOption(paths[navigate])!,
  );

  if (typeof children === 'function') {
    return children(destiationUrl);
  }

  return (
    <a
      onClick={e => {
        if (router) {
          e.preventDefault();
          router.push(destiationUrl);
        }
      }}
      href={destiationUrl}
      {...rest}
    >
      {children}
    </a>
  );
}
