import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Links } from '@/common/Links';
import { cookies } from 'next/headers';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

const fapi = 'https://artistic-tapir-20.clerk.accounts.dev';
const clerkVersion = '5.5.2';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db_jwt = cookies().get('__clerk_db_jwt')?.value;
  return (
    <ClerkProvider
      clerkJSUrl={'https://js.lclclerk.com/npm/clerk.browser.js'}
      appearance={{
        layout: {
          privacyPageUrl: 'dwada',
        },
        elements: {
          footer: {
            '>:nth-of-type(2)': {
              borderTopWidth: '0px',
            },
          },
          footerBranding: {
            borderTopWidth: 0,
          },
        },
      }}
    >
      <html lang='en'>
        <head>
          <link
            rel='prefetch'
            href={`${fapi}/v1/client?_clerk_js_version=${clerkVersion}&__clerk_db_jwt=${db_jwt}`}
            as='fetch'
            type='application/json'
            crossOrigin={'use-credentials'}
          />
          <link
            rel='prefetch'
            // href={`${fapi}/v1/environment?_clerk_js_version=${clerkVersion}&_method=PATCH&__clerk_db_jwt=${db_jwt}`}
            href={`${fapi}/v1/environment?_clerk_js_version=${clerkVersion}&__clerk_db_jwt=${db_jwt}`}
            as='fetch'
            type='application/json'
            crossOrigin={'use-credentials'}
          />
        </head>
        <body className={inter.className}>
          <Links />
          <div style={{ margin: '1rem', padding: '1rem', border: '1px solid green' }}>
            <h2>Root layout</h2>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
