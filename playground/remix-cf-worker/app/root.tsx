import type { MetaFunction, LoaderFunction } from '@remix-run/cloudflare';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/experimental/ssr.server';
import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix/experimental';

export const loader: LoaderFunction = args => {
  return rootAuthLoader(
    args,
    ({ request }) => {
      const { user } = request;
      console.log('Loaded user from root loader:', user);
      return { user };
    },
    { loadUser: true },
  );
};

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
