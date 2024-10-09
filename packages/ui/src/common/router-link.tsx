import { useClerkHostRouter } from '@clerk/shared/router';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

export const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean;
  }
>(function RouterLink({ asChild, children, href, ...props }, forwardedRef) {
  const router = useClerkHostRouter();
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={forwardedRef}
      {...props}
      href={href}
      onClick={e => {
        e.preventDefault();
        if (href) {
          router.push(href);
        }
      }}
    >
      {children}
    </Comp>
  );
});
