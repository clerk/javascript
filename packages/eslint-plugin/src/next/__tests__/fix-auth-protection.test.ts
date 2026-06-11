import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import * as tsParser from '@typescript-eslint/parser';
import { ESLint, type Linter as LinterTypes } from 'eslint';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { fixAuthProtection } from '../../fix-auth-protection';
import rule from '../require-auth-protection';

// Register the rule directly (rather than importing the `next` plugin barrel,
// which references the build-time `PACKAGE_VERSION` global) so the runner sees
// a `.../require-auth-protection` rule id.
function createESLint(cwd: string): ESLint {
  return new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.{ts,tsx}'],
      plugins: { '@clerk/next': { rules: { 'require-auth-protection': rule } } },
      languageOptions: {
        parser: tsParser as unknown as LinterTypes.Parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      rules: {
        '@clerk/next/require-auth-protection': ['error', { protected: ['app/**'], public: ['app/sign-in/**'] }],
      },
    },
  });
}

let projectRoot: string;

async function write(relPath: string, contents: string): Promise<string> {
  const abs = path.join(projectRoot, relPath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, contents, 'utf8');
  return abs;
}

beforeEach(async () => {
  projectRoot = await mkdtemp(path.join(tmpdir(), 'clerk-fix-auth-'));
});

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true });
});

describe('fixAuthProtection', () => {
  it('protects flagged resources and leaves public/protected ones alone', async () => {
    const page = await write(
      'app/dashboard/page.tsx',
      `export default function Page() {
  return <div>Hello</div>;
}
`,
    );
    const signIn = await write(
      'app/sign-in/page.tsx',
      `export default function Page() {
  return <div>Sign in</div>;
}
`,
    );
    const alreadyProtected = await write(
      'app/settings/page.tsx',
      `import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  await auth.protect();
  return <div>Settings</div>;
}
`,
    );

    const result = await fixAuthProtection({ cwd: projectRoot, patterns: ['.'], eslint: createESLint(projectRoot) });

    expect(result.unresolved).toEqual([]);
    expect(result.fixed).toEqual([{ filePath: page, protections: 1 }]);

    expect(await readFile(page, 'utf8')).toBe(`import { auth } from '@clerk/nextjs/server';
export default async function Page() {
  await auth.protect();
  return <div>Hello</div>;
}
`);
    // Public + already-protected files are untouched.
    expect(await readFile(signIn, 'utf8')).toContain('Sign in');
    expect(await readFile(signIn, 'utf8')).not.toContain('auth.protect');
    expect(await readFile(alreadyProtected, 'utf8')).toMatch(/await auth\.protect\(\);[\s\S]*Settings/);
  });

  it('protects multiple resources in a single file (shared import added once)', async () => {
    const route = await write(
      'app/api/widgets/route.ts',
      `export async function GET() {
  return new Response('ok');
}

export async function POST() {
  return new Response('ok');
}
`,
    );

    const result = await fixAuthProtection({ cwd: projectRoot, patterns: ['.'], eslint: createESLint(projectRoot) });

    expect(result.fixed).toEqual([{ filePath: route, protections: 2 }]);

    const output = await readFile(route, 'utf8');
    expect(output).toBe(`import { auth } from '@clerk/nextjs/server';
export async function GET() {
  await auth.protect();
  return new Response('ok');
}

export async function POST() {
  await auth.protect();
  return new Response('ok');
}
`);
    // The import is added exactly once even though two resources were fixed.
    expect(output.match(/@clerk\/nextjs\/server/g)).toHaveLength(1);
  });

  it('merges into an existing await auth() call instead of duplicating it', async () => {
    const page = await write(
      'app/dashboard/page.tsx',
      `import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  return <div>{userId}</div>;
}
`,
    );

    await fixAuthProtection({ cwd: projectRoot, patterns: ['.'], eslint: createESLint(projectRoot) });

    expect(await readFile(page, 'utf8')).toBe(`import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth.protect();
  return <div>{userId}</div>;
}
`);
  });

  it('does not write files in dryRun but still reports them', async () => {
    const original = `export default function Page() {
  return <div>Hello</div>;
}
`;
    const page = await write('app/dashboard/page.tsx', original);

    const result = await fixAuthProtection({
      cwd: projectRoot,
      patterns: ['.'],
      dryRun: true,
      eslint: createESLint(projectRoot),
    });

    expect(result.fixed).toEqual([{ filePath: page, protections: 1 }]);
    expect(await readFile(page, 'utf8')).toBe(original);
  });

  it('reports resources that have no safe automatic fix as unresolved', async () => {
    const reexport = await write('app/dashboard/page.tsx', `export { default } from './impl';\n`);

    const result = await fixAuthProtection({ cwd: projectRoot, patterns: ['.'], eslint: createESLint(projectRoot) });

    expect(result.fixed).toEqual([]);
    expect(result.unresolved).toHaveLength(1);
    expect(result.unresolved[0].filePath).toBe(reexport);
    expect(result.unresolved[0].issues[0].message).toContain("exported from './impl'");
  });
});
