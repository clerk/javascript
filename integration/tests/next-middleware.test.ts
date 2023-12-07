import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('next middleware @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ['/', '/hash/sign-in', '/hash/sign-up'],
  afterAuth: async (auth, req) => {
    const response = NextResponse.next();
    response.cookies.set({
      name: "first",
      value: "123456789",
      path: "/",
      sameSite: "none",
      secure: true,
    });
    response.cookies.set("second", "987654321", {
      sameSite: "none",
      secure: true,
    });
    response.cookies.set("third", "foobar", {
      sameSite: "none",
      secure: true,
    });
    return response;
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};`,
      )
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
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('authMiddleware passes through all cookies', async ({ browser }) => {
    // See https://playwright.dev/docs/api/class-browsercontext
    const context = await browser.newContext();
    const page = await context.newPage();
    const u = createTestUtils({ app, page });

    await page.goto(app.serverUrl);
    await u.po.signIn.waitForMounted();

    const cookies = await context.cookies();

    expect(cookies.find(c => c.name == 'first').value).toBe('123456789');
    expect(cookies.find(c => c.name == 'second').value).toBe('987654321');
    expect(cookies.find(c => c.name == 'third').value).toBe('foobar');

    await context.close();
  });
});
