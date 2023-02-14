import type { LoaderFunction, MetaFunction, Headers } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { getClerkDebugHeaders } from '@clerk/remix/ssr.server';
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';

export const loader: LoaderFunction = args => {
  return rootAuthLoader(
    args,
    ({ request }) => {
      const { user } = request;

      console.log('User:', user);

      return { user };
    },
    { loadUser: true },
  );
};

export function headers({
  actionHeaders,
  loaderHeaders,
  parentHeaders,
}: {
  actionHeaders: Headers;
  loaderHeaders: Headers;
  parentHeaders: Headers;
}) {
  return {
    'x-parent-header': parentHeaders.get('x-parent-header'),
    ...getClerkDebugHeaders(loaderHeaders),
  };
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const CatchBoundary = ClerkCatchBoundary();

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
