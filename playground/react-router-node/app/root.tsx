import { data, Await, Links, Meta, Outlet, Scripts, ScrollRestoration , DataStrategyFunctionArgs } from 'react-router';
import type { MetaFunction } from 'react-router';
import { rootAuthLoader } from '@clerk/react-router/ssr.server';
import { ClerkProvider } from '@clerk/react-router';
import { Suspense } from 'react';

export const loader = (args: DataStrategyFunctionArgs) => {
  return rootAuthLoader(
    args,
    async ({ request }) => {
      const { user } = request;
      const fooBar = await new Promise(r => r({ foo: 'bar' }));

      console.log('root User:', user);

      return data({ user, data: fooBar }, { headers: { 'x-clerk': '1' } })
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

export function Layout({ children }) {
  return (
    <html lang='en'>
    <head>
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
  )
}

export default function App({ loaderData }) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Suspense fallback="Loading...">
        <Await resolve={loaderData.data}>
          {val => (<>Hello {val.foo}</>)}
        </Await>
      </Suspense>
      <Outlet />
  </ClerkProvider>
  );
}
