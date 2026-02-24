/// <reference types="vite/client" />
import * as React from 'react';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ClerkProvider } from '@clerk/tanstack-react-start';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import appCss from '~/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider
          __internal_clerkJSUrl={import.meta.env.VITE_CLERK_JS_URL}
          __internal_clerkUIUrl={import.meta.env.VITE_CLERK_UI_URL}
          appearance={{
            options: {
              showOptionalFields: true,
            },
          }}
        >
          {children}
        </ClerkProvider>
        <TanStackRouterDevtools position='bottom-right' />
        <Scripts />
      </body>
    </html>
  );
}
