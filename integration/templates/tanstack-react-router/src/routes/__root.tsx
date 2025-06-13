import * as React from 'react';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ClerkProvider } from '@clerk/tanstack-react-start';

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
      <div className='p-2'>
        <div className='border-b'>I'm a layout</div>
        <div>
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools position='bottom-right' />
    </ClerkProvider>
  );
}
