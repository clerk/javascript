// import { defer } from 'react-router';
import type { MetaFunction } from 'react-router';
import { Await, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';
import { rootAuthLoader } from '@clerk/react-router/ssr.server';
import { ClerkApp } from '@clerk/react-router';
import { Suspense } from 'react';
import { DataStrategyFunctionArgs } from 'react-router';

export const loader = (args: DataStrategyFunctionArgs) => {
  return rootAuthLoader(
    args,
    async ({ request }) => {
      const { user } = request;
      const data: Promise<{ foo: string }> = new Promise(r => r({ foo: 'bar' }))

      console.log('root User:', user);

      return Response.json({ user, data }, { headers: { 'x-clerk': '1' } })
    },
    { loadUser: true },
  );
};

export function headers({
  loaderHeaders,
}: {
  actionHeaders: Headers;
  loaderHeaders: Headers;
  parentHeaders: Headers;
}) {
  console.log(loaderHeaders)
  return loaderHeaders
}

export const meta: MetaFunction = () => {
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
        <Suspense fallback="Loading...">
          <Await resolve={loaderData.data}>
            {val => (<>Hello {val.foo}</>)}
          </Await>
        </Suspense>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default ClerkApp(App);
