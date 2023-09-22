import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix';

export const loader: LoaderFunction = args => {
  return rootAuthLoader(args);
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);

export const ErrorBoundary = ClerkErrorBoundary();
