import path from 'node:path';

import * as tsParser from '@typescript-eslint/parser';
import type { Linter as LinterTypes } from 'eslint';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import rule from '../require-auth-protection';

RuleTester.describe = describe;
RuleTester.it = it;

// See require-auth-protection.test.ts: filenames are anchored under a synthetic
// project root whose own path contains no `/app/` segment.
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

const config = { protected: ['app/**'] };

ruleTester.run('require-auth-protection (suggestions)', rule, {
  valid: [],
  invalid: [
    {
      name: 'page: sync default export — flips async, inserts call and import',
      code: `export default function Page() {
  return <div>Hello</div>;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export default async function Page() {
  await auth.protect();
  return <div>Hello</div>;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'page: concise-body arrow default export — wraps in a block',
      code: `export default () => null;`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export default async () => {
  await auth.protect();
  return null;
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'route: concise-body arrow returning a parenthesized object literal wraps without leaving parens',
      code: `export const GET = () => ({ ok: true });`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export const GET = async () => {
  await auth.protect();
  return { ok: true };
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'page: concise-body arrow returning parenthesized JSX wraps without leaving parens',
      code: `export default () => (<div>Hello</div>);`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export default async () => {
  await auth.protect();
  return <div>Hello</div>;
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'page: default-exported local identifier',
      code: `function Page() {
  return <div>Hello</div>;
}

export default Page;`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
async function Page() {
  await auth.protect();
  return <div>Hello</div>;
}

export default Page;`,
            },
          ],
        },
      ],
    },
    {
      name: 'route: GET function declaration and POST const arrow',
      code: `export async function GET() {
  return new Response('ok');
}

export const POST = () => new Response('ok');`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export async function GET() {
  await auth.protect();
  return new Response('ok');
}

export const POST = () => new Response('ok');`,
            },
          ],
        },
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export async function GET() {
  return new Response('ok');
}

export const POST = async () => {
  await auth.protect();
  return new Response('ok');
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'use server module: inserts import after the directive',
      code: `'use server';

export async function loadData() {
  return [];
}`,
      filename: abs('app/components/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `'use server';
import { auth } from "@clerk/nextjs/server";

export async function loadData() {
  await auth.protect();
  return [];
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'inline server function: inserts call after the inline directive',
      code: `export async function action() {
  'use server';
  return doStuff();
}`,
      filename: abs('app/dashboard/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export async function action() {
  'use server';
  await auth.protect();
  return doStuff();
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'inline server function: sync function expression also gets the async flip',
      code: `const action = function () {
  'use server';
  return null;
};`,
      filename: abs('app/dashboard/actions.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
const action = async function () {
  'use server';
  await auth.protect();
  return null;
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'inline server function: nested inline arrow keeps its indentation',
      code: `export function getAction() {
  const create = async () => {
    'use server';
    return null;
  };
  return create;
}`,
      filename: abs('app/dashboard/utils.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export function getAction() {
  const create = async () => {
    'use server';
    await auth.protect();
    return null;
  };
  return create;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'aliased auth import: reuses the local name, adds no import',
      code: `import { auth as clerkAuth } from '@clerk/nextjs/server';

export default function Page() {
  return null;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth as clerkAuth } from '@clerk/nextjs/server';

export default async function Page() {
  await clerkAuth.protect();
  return null;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'existing clerk import without auth: merges the specifier',
      code: `import { currentUser } from '@clerk/nextjs/server';

export default function Page() {
  return null;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { currentUser, auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();
  return null;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'double-quoted clerk import without auth: merges the specifier without changing quote style',
      code: `import { currentUser } from "@clerk/nextjs/server";

export default function Page() {
  return null;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { currentUser, auth } from "@clerk/nextjs/server";

export default async function Page() {
  await auth.protect();
  return null;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'double-quoted import in file: new auth import matches file quote style',
      code: `import { redirect } from "next/navigation";

export default function Page() {
  return null;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  await auth.protect();
  return null;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'namespace import before named import: merges auth into named import',
      code: `import * as clerk from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';

export default function Page() {
  return null;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import * as clerk from '@clerk/nextjs/server';
import { currentUser, auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();
  return null;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'existing await auth() destructure: merges .protect() into the call',
      code: `import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  return <div>{userId}</div>;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth.protect();
  return <div>{userId}</div>;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'existing bare await auth(): merges .protect() into the call',
      code: `import { auth } from "@clerk/nextjs/server";

export async function GET() {
  await auth();
  return new Response('ok');
}`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";

export async function GET() {
  await auth.protect();
  return new Response('ok');
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'concise arrow awaiting auth(): merges .protect() into the call',
      code: `import { auth } from "@clerk/nextjs/server";

export const POST = async () => await auth();`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";

export const POST = async () => await auth.protect();`,
            },
          ],
        },
      ],
    },
    {
      name: 'aliased await auth() destructure: merges using the alias',
      code: `import { auth as clerkAuth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await clerkAuth();
  return <div>{userId}</div>;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth as clerkAuth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await clerkAuth.protect();
  return <div>{userId}</div>;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'page: sync default export with explicit return type — wraps in Promise',
      code: `export default function Page(): JSX.Element {
  return <div>Hello</div>;
}`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export default async function Page(): Promise<JSX.Element> {
  await auth.protect();
  return <div>Hello</div>;
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'route: sync arrow with explicit return type — wraps in Promise',
      code: `export const GET = (): Response => new Response('ok');`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export const GET = async (): Promise<Response> => {
  await auth.protect();
  return new Response('ok');
};`,
            },
          ],
        },
      ],
    },
    {
      name: 'route: sync function with Promise return type — does not double-wrap',
      code: `export function GET(): Promise<Response> {
  return Promise.resolve(new Response('ok'));
}`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export async function GET(): Promise<Response> {
  await auth.protect();
  return Promise.resolve(new Response('ok'));
}`,
            },
          ],
        },
      ],
    },
    {
      name: 'route: type-predicate return type — adds async but does not wrap return type',
      code: `export function GET(value: unknown): value is boolean {
  return typeof value === 'boolean';
}`,
      filename: abs('app/api/widgets/route.ts'),
      options: [config],
      errors: [
        {
          messageId: 'missingProtect',
          suggestions: [
            {
              messageId: 'addAuthProtect',
              output: `import { auth } from "@clerk/nextjs/server";
export async function GET(value: unknown): value is boolean {
  await auth.protect();
  return typeof value === 'boolean';
}`,
            },
          ],
        },
      ],
    },
    {
      name: 're-exported default: reported as imported, offers no suggestion',
      code: `export { default } from './implementation';`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'exportImported', suggestions: [] }],
    },
    {
      name: 'wrapped default export: unverifiable, offers no suggestion',
      code: `import { withAuth } from '@/lib';
import Impl from './impl';

export default withAuth(Impl);`,
      filename: abs('app/dashboard/page.tsx'),
      options: [config],
      errors: [{ messageId: 'unverifiableExport', suggestions: [] }],
    },
  ],
});
