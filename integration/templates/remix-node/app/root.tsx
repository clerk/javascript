import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';

export const loader: LoaderFunction = args => rootAuthLoader(args);

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])];

function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1'
        />
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

// TODO: Add clerkJsUrl
export default ClerkApp(App);
export const CatchBoundary = ClerkCatchBoundary();
