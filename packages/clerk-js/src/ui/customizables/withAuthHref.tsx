import React, { forwardRef } from 'react';

import { useCoreClerk } from '../contexts';

type WithAuthHrefProps<T> = T & { href?: string; useBuildUrlWithAuth?: boolean };

/**
 * This HOC is used to apply `buildUrlWithAuth` to the href of the element.
 */
export const withAuthHref = <P,>(Component: React.FunctionComponent<P>) => {
  return forwardRef((props: WithAuthHrefProps<any>, ref) => {
    const { href, useBuildUrlWithAuth = true, ...rest } = props;
    const clerk = useCoreClerk();

    return (
      <Component
        href={useBuildUrlWithAuth ? clerk.buildUrlWithAuth(href) : href}
        ref={ref}
        {...rest}
      />
    );
  }) as React.FunctionComponent<WithAuthHrefProps<P>>;
};
