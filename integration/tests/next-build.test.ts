import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';

type RenderingModeTestCase = {
  name: string;
  type: 'Static' | 'Dynamic';
  page: string;
};

function getIndicator(buildOutput: string, type: 'Static' | 'Dynamic') {
  return buildOutput
    .split('\n')
    .find(msg => {
      const isTypeFound = msg.includes(`(${type})`);

      if (type === 'Dynamic') {
        return isTypeFound || msg.includes(`(Server)`);
      }
      return isTypeFound;
    })
    .split(' ')[0];
}

test.describe('next build - provider as client component @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/provider.tsx',
        () => `'use client'
import { ClerkProvider } from "@clerk/nextjs"

export function Provider({ children }: { children: any }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}`,
      )
      .addFile(
        'src/app/layout.tsx',
        () => `import './globals.css';
import { Inter } from 'next/font/google';
import { Provider } from './provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </Provider>
  );
}
      `,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.build();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('When <ClerkProvider /> is used as a client component, builds successfully and does not force dynamic rendering', () => {
    // Get the static indicator from the build output
    const staticIndicator = getIndicator(app.buildOutput, 'Static');

    /**
     * Using /_not-found as it is an internal page that should statically render by default.
     * This is a good indicator of whether or not the entire app has been opted-in to dynamic rendering.
     */
    const notFoundPageLine = app.buildOutput.split('\n').find(msg => msg.includes('/_not-found'));

    expect(notFoundPageLine).toContain(staticIndicator);
  });
});

test.describe('next build - dynamic options @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/(dynamic)/layout.tsx',
        () => `import '../globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider dynamic>
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
      `,
      )
      .addFile(
        'src/app/(dynamic)/dynamic/page.tsx',
        () => `export default function DynamicPage() {
  return(<h1>This page is dynamic</h1>);
      }`,
      )
      .addFile(
        'src/app/nested-provider/page.tsx',
        () => `import { ClerkProvider } from '@clerk/nextjs';
      import { ClientComponent } from './client';
      
      export default function Page() {
        return (
          <ClerkProvider dynamic>
            <ClientComponent />
          </ClerkProvider>
        );
      }
      `,
      )
      .addFile(
        'src/app/nested-provider/client.tsx',
        () => `'use client';

      import { useAuth } from '@clerk/nextjs';
      
      export function ClientComponent() {
        useAuth();
      
        return <p>I am dynamically rendered</p>;
      }
      `,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.build();
  });

  test.afterAll(async () => {
    // await app.teardown();
  });

  (
    [
      {
        name: '<ClerkProvider> supports static rendering by default',
        type: 'Static',
        page: '/_not-found',
      },
      {
        name: '<ClerkProvider dynamic> opts-in to dynamic rendering',
        type: 'Dynamic',
        page: '/dynamic',
      },
      {
        name: 'auth() opts in to dynamic rendering',
        type: 'Dynamic',
        page: '/page-protected',
      },
      {
        name: '<ClerkProvider dynamic> can be nested in the root provider',
        type: 'Dynamic',
        page: '/nested-provider',
      },
    ] satisfies RenderingModeTestCase[]
  ).forEach(({ name, type, page }) => {
    test(`ClerkProvider rendering modes - ${name}`, () => {
      // Get the indicator from the build output
      const indicator = getIndicator(app.buildOutput, type);

      const pageLine = app.buildOutput.split('\n').find(msg => msg.includes(page));

      expect(pageLine).toContain(indicator);
    });
  });
});
