import * as React from 'react';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ClerkProvider } from '@clerk/tanstack-start';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to='/'>Start Over</Link>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <ClerkProvider>
      <Outlet />
      <TanStackRouterDevtools position='bottom-right' />
    </ClerkProvider>
  );
}
