import type { DataFunctionArgs, Headers } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { getClerkDebugHeaders, rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp, V2_ClerkErrorBoundary } from '@clerk/remix';

export const loader = (args: DataFunctionArgs) => {
  return rootAuthLoader(
    args,
    ({ request }) => {
      const { user } = request;

      console.log('root User:', user);

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

export const meta: V2_MetaFunction = () => {
  return [
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Remix',
        url: 'https://remix.run',
      },
    },
  ];
};

export const ErrorBoundary = V2_ClerkErrorBoundary();

function App() {
  const loaderData = useLoaderData<typeof loader>();

  console.log('root: ', { loaderData });

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
