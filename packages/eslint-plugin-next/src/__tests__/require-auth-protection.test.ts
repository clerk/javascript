import path from 'node:path';

import * as tsParser from '@typescript-eslint/parser';
import type { Linter as LinterTypes } from 'eslint';
import { Linter, RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import rule, { type RuleOptions } from '../rules/require-auth-protection.js';

RuleTester.describe = describe;
RuleTester.it = it;

// `RuleTester` lints in-memory code, so no fixture files need to exist on disk.
// The rule classifies a file by finding the `/app/` substring in its path
// (`getRelativeFolder` uses `indexOf('/app/')`), so filenames are anchored under
// a synthetic project root whose own path does not contain an `/app/` segment.
const projectRoot = '/clerk/apps/dashboard';
const abs = (p: string) => path.posix.join(projectRoot, p);

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser as unknown as LinterTypes.Parser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

const config = {
  protected: ['app/**'],
  public: ['app/(routes)/(unauthenticated)/**'],
};

ruleTester.run('require-auth-protection', rule, {
  valid: [
    {
      name: 'protected page with await auth.protect()',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          await auth.protect();
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page with (await auth()).protect()',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          await (await auth()).protect();
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page using arrow function default export',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async () => {
          await auth.protect();
          return <div>Hello</div>;
        };
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page destructuring auth.protect() return value',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { sessionId, orgId } = await auth.protect();
          return <div>{sessionId}-{orgId}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page assigning auth.protect() return value to a variable',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const result = await auth.protect();
          return <div>{result.userId}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page declaring function above and exporting identifier',
      code: `
        import { auth } from '@clerk/nextjs/server';
        async function PageComponent() {
          await auth.protect();
          return <div />;
        }
        export default PageComponent;
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page using const arrow assignment + identifier default export',
      code: `
        import { auth } from '@clerk/nextjs/server';
        const PageComponent = async () => {
          await auth.protect();
          return <div />;
        };
        export default PageComponent;
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected page exporting local as default via specifier (`export { Page as default }`)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        async function Page() {
          await auth.protect();
          return <div />;
        }
        export { Page as default };
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: userId === null with redirect',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { redirect } from 'next/navigation';
        export default async function Page() {
          const { userId } = await auth();
          if (userId === null) redirect('/sign-in');
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: userId === null in block, with notFound',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { notFound } from 'next/navigation';
        export default async function Page() {
          const { userId } = await auth();
          if (userId === null) {
            notFound();
          }
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: userId == null (loose equality) with return',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (userId == null) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: !isAuthenticated with return',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { isAuthenticated } = await auth();
          if (!isAuthenticated) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: isAuthenticated === false with throw',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { isAuthenticated } = await auth();
          if (isAuthenticated === false) throw new Error('unauth');
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: sessionId === null with redirect',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { redirect } from 'next/navigation';
        export default async function Page() {
          const { sessionId } = await auth();
          if (sessionId === null) redirect('/sign-in');
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'manual check: multiple bindings, check is on one of them',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId, sessionId, isAuthenticated } = await auth();
          if (!isAuthenticated) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'leading directive is skipped (use cache before protect)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          'use cache';
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'leading TS type alias is skipped (compile-time only)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          type LocalParams = { id: string };
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/[id]/page.tsx'),
      options: [config],
    },
    {
      name: 'leading TS interface is skipped (compile-time only)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          interface Local { id: string }
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'leading directive + TS type alias before manual auth check',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          'use strict';
          type LocalState = 'a' | 'b';
          const { userId } = await auth();
          if (userId === null) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'TS type alias between auth() destructure and guard is skipped',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          type LocalState = 'a' | 'b';
          if (userId === null) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: "'use client' page is skipped (protection happens on a server ancestor)",
      code: `
        'use client';
        import { useUser } from '@clerk/nextjs';
        export default function Page() {
          const { user } = useUser();
          return <div>{user?.firstName}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: "'use client' layout is skipped",
      code: `
        'use client';
        export default function Layout({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/layout.tsx'),
      options: [config],
    },
    {
      name: "'use client' template is skipped",
      code: `
        'use client';
        export default function Template({ children }) {
          return <div>{children}</div>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/template.tsx'),
      options: [config],
    },
    {
      name: 'manual check: flipped binary expression (null === userId)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (null === userId) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'public page in (unauthenticated) without protect call',
      code: `
        export default function SignIn() {
          return <div>Sign in</div>;
        }
      `,
      filename: abs('app/(routes)/(unauthenticated)/sign-in/page.tsx'),
      options: [config],
    },
    {
      name: 'public page with a protect call (over-protecting allowed)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function SignIn() {
          await auth.protect();
          return <div>Sign in</div>;
        }
      `,
      filename: abs('app/(routes)/(unauthenticated)/sign-in/page.tsx'),
      options: [config],
    },
    {
      name: 'route handler with GET and POST, both protected',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export async function GET() {
          await auth.protect();
          return new Response('ok');
        }
        export async function POST() {
          await auth.protect();
          return new Response('ok');
        }
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'route handler exported as const arrow',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export const GET = async () => {
          await auth.protect();
          return new Response('ok');
        };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'route handler declared above and re-exported via specifier',
      code: `
        import { auth } from '@clerk/nextjs/server';
        async function POST() {
          await auth.protect();
          return new Response('ok');
        }
        export { POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'route handler declared with private name and renamed via `as`',
      code: `
        import { auth } from '@clerk/nextjs/server';
        async function handlePost() {
          await auth.protect();
          return new Response('ok');
        }
        export { handlePost as POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'route handler whose specifier export refers to a non-HTTP-method local',
      code: `
        async function helper() {
          return new Response('ok');
        }
        export { helper };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'route handler namespace re-export is not treated as a top-level handler',
      code: `
        export * as handlers from './handlers';
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
    },
    {
      name: 'Server Function module with use server, all exports protected',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        export async function deleteUser(id) {
          await auth.protect();
          return id;
        }
        export async function updateUser(id) {
          await auth.protect();
          return id;
        }
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'Server Function namespace re-export is not treated as individual functions',
      code: `
        'use server';
        export * as actions from './implementations';
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'Server Function declared above and re-exported via specifier',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        async function deleteUser(id) {
          await auth.protect();
          return id;
        }
        export { deleteUser };
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'Server Function exported under a different name via `as`',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        async function _deleteUser(id) {
          await auth.protect();
          return id;
        }
        export { _deleteUser as deleteUser };
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'type-only exports via `export type { ... }` are not treated as Server Functions',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        export type { UserRecord };
        export async function deleteUser(id) {
          await auth.protect();
          return id;
        }
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'type-only exports via `export { type ... }` are not treated as Server Functions',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        export { type UserRecord };
        export async function deleteUser(id) {
          await auth.protect();
          return id;
        }
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
    },
    {
      name: 'protected page with protected inline Server Function',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          await auth.protect();
          async function updateUser() {
            'use server';
            await auth.protect();
            return 1;
          }
          return <form action={updateUser} />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
    },
    {
      name: 'protected non-resource module with protected inline Server Function',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export function UsersPanel() {
          async function updateUser() {
            'use server';
            await auth.protect();
            return 1;
          }
          return <form action={updateUser} />;
        }
      `,
      // Note how this is not page.tsx etc
      filename: abs('app/admin/users/users-panel.tsx'),
      options: [config],
    },
    {
      name: 'protected inline Server Function with manual auth guard',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export function UsersPanel() {
          async function updateUser() {
            'use server';
            const { userId } = await auth();
            if (userId === null) return null;
            return 1;
          }
          return <form action={updateUser} />;
        }
      `,
      filename: abs('app/admin/users/users-panel.tsx'),
      options: [config],
    },
    {
      name: 'public folder inline Server Function without protect call',
      code: `
        export default function SignIn() {
          async function submit() {
            'use server';
            return 1;
          }
          return <form action={submit} />;
        }
      `,
      filename: abs('app/(routes)/(unauthenticated)/sign-in/page.tsx'),
      options: [config],
    },
    {
      name: "'use client' module with nested use server directive is skipped",
      code: `
        'use client';
        export function ClientWidget() {
          async function submit() {
            'use server';
            return 1;
          }
          return <button formAction={submit}>Save</button>;
        }
      `,
      filename: abs('app/dashboard/client-widget.tsx'),
      options: [config],
    },
    {
      name: 'file outside app/ is ignored entirely',
      code: `
        export default function Foo() {
          return null;
        }
      `,
      filename: abs('utils/foo.ts'),
      options: [config],
    },
    {
      name: 'non-resource file in app/ is ignored',
      code: `
        export function helper() {
          return 1;
        }
      `,
      filename: abs('app/dashboard/_helpers.ts'),
      options: [config],
    },
    {
      name: 'mixed-scope root layout without protect call (auto mode, skipped silently)',
      code: `
        export default function RootLayout({ children }) {
          return <html><body>{children}</body></html>;
        }
      `,
      filename: abs('app/layout.tsx'),
      options: [config],
    },
    {
      name: 'mixed-scope intermediate layout without protect call (auto mode, skipped silently)',
      code: `
        export default function RoutesLayout({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/layout.tsx'),
      options: [config],
    },
    {
      name: 'mixed-scope layout listed in mixedScopeLayouts (skipped silently)',
      code: `
        export default function RootLayout({ children }) {
          return <html><body>{children}</body></html>;
        }
      `,
      filename: abs('app/layout.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: ['app', 'app/(routes)'],
        },
      ],
    },
    {
      name: 'non-mixed-scope layout (no public descendants) is unaffected by mixedScopeLayouts',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function AdminLayout({ children }) {
          await auth.protect();
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/layout.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: [],
        },
      ],
    },
    {
      name: 'protected-only template with protect call',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function AdminTemplate({ children }) {
          await auth.protect();
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/template.tsx'),
      options: [config],
    },
    {
      name: 'mixed-scope template listed in mixedScopeLayouts (skipped silently)',
      code: `
        export default function RootTemplate({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/template.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: ['app'],
        },
      ],
    },
    {
      name: 'protected-only layout with protect call',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function AdminLayout({ children }) {
          await auth.protect();
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/layout.tsx'),
      options: [config],
    },
    {
      name: 'intercepting route in protected folder with protect call (classified by source folder)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Modal() {
          await auth.protect();
          return <div>modal</div>;
        }
      `,
      filename: abs('app/feed/(.)photo/[id]/page.tsx'),
      options: [
        {
          protected: ['app/**'],
          public: [],
        },
      ],
    },
    {
      name: 'intercepting route in public folder, no protect call (classified by source folder)',
      code: `
        export default async function Modal() {
          return <div>modal</div>;
        }
      `,
      filename: abs('app/(routes)/(unauthenticated)/feed/(.)photo/[id]/page.tsx'),
      options: [config],
    },
  ],

  invalid: [
    {
      name: 'protected page missing protect call',
      code: `
        export default async function Page() {
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'auth.protect() in a later declarator does not count — earlier code ran first',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const sideEffect = doWork(), ok = await auth.protect();
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'await auth() in a later declarator does not count — earlier code ran first',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const sideEffect = doWork(), { userId } = await auth();
          if (userId === null) redirect('/sign-in');
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected page with non-async default export',
      code: `
        export default function Page() {
          return <div>Hello</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected page exporting local as default via specifier, missing protect',
      code: `
        async function Page() {
          return <div>Hello</div>;
        }
        export { Page as default };
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected page re-exporting default from another module (`export { default } from`)',
      code: `
        export { default } from './Page';
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'exportImported', data: { subject: 'page', source: './Page' } }],
    },
    {
      name: 'protected page re-exporting local as default from another module (`export { Page as default } from`)',
      code: `
        export { Page as default } from './Page';
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'exportImported', data: { subject: 'page', source: './Page' } }],
    },
    {
      name: 'protected page with protect call inside Suspense (not top-level)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { Suspense } from 'react';
        async function Inner() {
          await auth.protect();
          return null;
        }
        export default async function Page() {
          return (
            <Suspense>
              <Inner />
            </Suspense>
          );
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected page with protect call after a return',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          return <div>Hello</div>;
          await auth.protect();
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected route handler with one method missing protect',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export async function GET() {
          await auth.protect();
          return new Response('ok');
        }
        export async function POST() {
          return new Response('ok');
        }
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'route handler declared above and re-exported via specifier, missing protect',
      code: `
        async function POST() {
          return new Response('ok');
        }
        export { POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [{ messageId: 'missingProtect', data: { subject: 'POST handler' } }],
    },
    {
      name: 'route handler renamed via `as`, local missing protect (reported under exported name)',
      code: `
        async function handlePost() {
          return new Response('ok');
        }
        export { handlePost as POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [{ messageId: 'missingProtect', data: { subject: 'POST handler' } }],
    },
    {
      name: 'route handler re-exported from another module via specifier with source',
      code: `
        export { POST } from './handlers';
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: { subject: 'POST handler', source: './handlers' },
        },
      ],
    },
    {
      name: 'route handler whose specifier export refers to an imported binding',
      code: `
        import { POST } from './handlers';
        export { POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: { subject: 'POST handler', source: './handlers' },
        },
      ],
    },
    {
      name: 'route handler specifier export resolves to HOF (unknown), reported as unverifiable',
      code: `
        import { withAuth } from '@/lib/with-auth';
        async function _POST() { return new Response('ok'); }
        const POST = withAuth(_POST);
        export { POST };
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [{ messageId: 'unverifiableExport', data: { subject: 'POST handler' } }],
    },
    {
      name: 'route handlers re-exported via `export *` cannot be verified',
      code: `
        export * from './handlers';
      `,
      filename: abs('app/api/things/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: { subject: 'route handlers', source: './handlers' },
        },
      ],
    },
    {
      name: 'protected Server Function module with one export missing protect',
      code: `
        'use server';
        import { auth } from '@clerk/nextjs/server';
        export async function safeAction() {
          await auth.protect();
        }
        export async function unsafeAction() {
          // forgot the protect call
          return 1;
        }
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'Server Function declared above and re-exported via specifier, missing protect',
      code: `
        'use server';
        async function deleteUser(id) {
          return id;
        }
        export { deleteUser };
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          data: { subject: "Server Function 'deleteUser'" },
        },
      ],
    },
    {
      name: 'Server Function specifier export resolves to HOF (unknown), reported as unverifiable',
      code: `
        'use server';
        import { withAuth } from '@/lib/with-auth';
        async function _deleteUser(id) { return id; }
        const deleteUser = withAuth(_deleteUser);
        export { deleteUser };
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'unverifiableExport',
          data: { subject: "Server Function 'deleteUser'" },
        },
      ],
    },
    {
      name: 'Server Function re-exported from another module via specifier with source',
      code: `
        'use server';
        export { deleteUser } from './implementations';
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: {
            subject: "Server Function 'deleteUser'",
            source: './implementations',
          },
        },
      ],
    },
    {
      name: 'Server Functions re-exported via `export *` cannot be verified',
      code: `
        'use server';
        export * from './implementations';
      `,
      filename: abs('app/admin/users/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: { subject: 'Server Functions', source: './implementations' },
        },
      ],
    },
    {
      name: 'protected page with inline Server Function missing protect',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          await auth.protect();
          async function updateUser() {
            'use server';
            return 1;
          }
          return <form action={updateUser} />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect', data: { subject: 'Inline Server Function' } }],
    },
    {
      name: 'protected non-resource module with inline Server Function missing protect',
      code: `
        export function UsersPanel() {
          async function updateUser() {
            'use server';
            return 1;
          }
          return <form action={updateUser} />;
        }
      `,
      filename: abs('app/admin/users/users-panel.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect', data: { subject: 'Inline Server Function' } }],
    },
    {
      name: 'protected-only layout without protect call',
      code: `
        export default function AdminLayout({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/layout.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'protected-only template without protect call',
      code: `
        export default function AdminTemplate({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/(routes)/(org-level)/apps/template.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'mixed-scope template not listed in mixedScopeLayouts (explicit mode, warns)',
      code: `
        export default function RootTemplate({ children }) {
          return <>{children}</>;
        }
      `,
      filename: abs('app/template.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: ['app/(routes)'],
        },
      ],
      errors: [
        {
          messageId: 'unlistedMixedScopeLayout',
          data: { folder: 'app', fileKind: 'template' },
        },
      ],
    },
    {
      name: 'mixed-scope layout not listed in mixedScopeLayouts (explicit mode, warns)',
      code: `
        export default function RootLayout({ children }) {
          return <html><body>{children}</body></html>;
        }
      `,
      filename: abs('app/layout.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: ['app/(routes)'],
        },
      ],
      errors: [
        {
          messageId: 'unlistedMixedScopeLayout',
          data: { folder: 'app', fileKind: 'layout' },
        },
      ],
    },
    {
      name: 'await before protect is NOT accepted',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const data = await fetchSensitive();
          await auth.protect();
          return <div>{data}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'await params before protect is NOT accepted (no preamble allowlist)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page({ params }) {
          const { id } = await params;
          await auth.protect();
          return <div>{id}</div>;
        }
      `,
      filename: abs('app/dashboard/[id]/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'await searchParams before protect is NOT accepted (no preamble allowlist)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page({ searchParams }) {
          const { tab } = await searchParams;
          await auth.protect();
          return <div>{tab}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'await headers() before protect is NOT accepted (no preamble allowlist)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { headers } from 'next/headers';
        export default async function Page() {
          const requestHeaders = await headers();
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'directive followed by sync assignment before protect is NOT accepted',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          'use strict';
          const queryClient = getQueryClient();
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'voided prefetch before protect is NOT accepted (effectful, no await)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          void queryClient.prefetchQuery(getUsersQuery());
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'synchronous assignment before protect is NOT accepted',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const queryClient = getQueryClient();
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'statement between auth() destructure and guard is NOT accepted',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page({ searchParams }) {
          const { userId } = await auth();
          const tab = searchParams?.tab ?? 'overview';
          if (userId === null) return null;
          return <div>{tab}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'side effect in same declaration as auth() destructure is NOT accepted',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth(), side = doWork();
          if (userId === null) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'preamble matched but with mixed non-preamble in same VariableDeclaration',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page({ params }) {
          const a = await params, b = await fetchSensitive();
          await auth.protect();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/[id]/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: !userId is NOT accepted (less explicit than === null)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (!userId) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: userId === undefined is NOT accepted (server userId is never undefined)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (userId === undefined) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: orgId === null is NOT accepted (orgId can be null while signed in)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        import { redirect } from 'next/navigation';
        export default async function Page() {
          const { orgId } = await auth();
          if (orgId === null) redirect('/select-org');
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: consequent does not exit (just logs)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (userId === null) console.log('uh oh');
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: awaited work between destructure and guard',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          const data = await fetchSensitive();
          if (userId === null) return null;
          return <div>{data}</div>;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: inverted condition (userId !== null)',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId } = await auth();
          if (userId !== null) doSomething();
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'manual check: aliased destructure not recognized',
      code: `
        import { auth } from '@clerk/nextjs/server';
        export default async function Page() {
          const { userId: uid } = await auth();
          if (uid === null) return null;
          return <div />;
        }
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'function declaration + identifier default export, function lacks protect',
      code: `
        async function PageComponent() {
          return <div />;
        }
        export default PageComponent;
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'missingProtect' }],
    },
    {
      name: 'imported and re-exported as default (rule cannot follow imports)',
      code: `
        import PageComponent from './component';
        export default PageComponent;
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'exportImported',
          data: { subject: 'page', source: './component' },
        },
      ],
    },
    {
      name: 'HOF-wrapped default export resolves to unknown, reported as unverifiable',
      code: `
        import { withAuth } from '@/lib/with-auth';
        function BasePage() { return <div />; }
        const Page = withAuth(BasePage);
        export default Page;
      `,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'unverifiableExport', data: { subject: 'page' } }],
    },
    {
      name: 'mixed-scope layout under empty allowlist (max strictness, warns)',
      code: `
        export default function RootLayout({ children }) {
          return <html><body>{children}</body></html>;
        }
      `,
      filename: abs('app/layout.tsx'),
      options: [
        {
          ...config,
          mixedScopeLayouts: [],
        },
      ],
      errors: [{ messageId: 'unlistedMixedScopeLayout' }],
    },
    {
      name: 'intercepting route in protected folder without protect call (classified by source folder)',
      code: `
        export default async function Modal() {
          return <div>modal</div>;
        }
      `,
      filename: abs('app/feed/(..)admin/page.tsx'),
      options: [
        {
          protected: ['app/**'],
          public: [],
        },
      ],
      errors: [{ messageId: 'missingProtect' }],
    },
  ],
});

describe('require-auth-protection schema validation', () => {
  // Linter.verify throws synchronously on schema errors when no filename is
  // passed (with a filename, configs that don't apply to the file are
  // skipped before validation runs). RuleTester.run does not validate the
  // schema at all, so we go through Linter directly.
  const lintWithOptions = (options: RuleOptions | Record<string, unknown>) => {
    const linter = new Linter();
    return linter.verify('export default function X() {}', {
      plugins: {
        '@clerk/next': {
          rules: { 'require-auth-protection': rule },
        },
      },
      rules: {
        '@clerk/next/require-auth-protection': ['warn', options],
      },
    });
  };

  it('rejects configs missing `protected`', () => {
    expect(() => lintWithOptions({ public: ['app/(unauthenticated)/**'] })).toThrow(/protected/);
  });

  it('rejects configs with `protected: []` (empty array)', () => {
    expect(() => lintWithOptions({ protected: [] })).toThrow(/fewer than 1 items|minItems|protected/);
  });

  it('accepts configs with `protected` set and other options omitted', () => {
    expect(() => lintWithOptions({ protected: ['app/**'] })).not.toThrow();
  });
});
