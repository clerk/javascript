import { LoaderFunction } from '@remix-run/node';
import { Await, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix';
import { defer } from '@remix-run/server-runtime';
import { Suspense } from 'react';

export const loader: LoaderFunction = args =>
  rootAuthLoader(args, () => {
    const data: Promise<{ foo: string }> = new Promise(r => r({ foo: 'bar' }));

    return defer({ data });
  });

function App() {
  const loaderData = useLoaderData<typeof loader>();

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
        <Suspense fallback='Loading...'>
          <Await resolve={loaderData.data}>{val => <>Deferred value: {val.foo}</>}</Await>
        </Suspense>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);
export const ErrorBoundary = ClerkErrorBoundary();
