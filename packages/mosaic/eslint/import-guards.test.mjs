import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const packageRoot = path.resolve(import.meta.dirname, '..');
let mosaicRoot;
const featureDir = 'src/features/reverification';
const testFixture = 'src/hooks/__tests__/sample.test.ts';
const partFixture = 'src/primitives/sample-part.tsx';
const partTestFixture = 'src/primitives/__tests__/sample-part.test.tsx';
const execute = promisify(execFile);
const require = createRequire(path.join(packageRoot, 'package.json'));
const oxlint = path.join(path.dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');

beforeAll(async () => {
  mosaicRoot = await realpath(await mkdtemp(path.join(tmpdir(), 'mosaic-oxlint-')));
  await cp(path.join(packageRoot, 'src'), path.join(mosaicRoot, 'src'), { recursive: true });
  for (const file of ['package.json', 'tsconfig.json', 'tsconfig.base.json', 'tsconfig.test.json']) {
    await cp(path.join(packageRoot, file), path.join(mosaicRoot, file));
  }
  await symlink(path.join(packageRoot, 'node_modules'), path.join(mosaicRoot, 'node_modules'), 'dir');
  const configUrl = pathToFileURL(path.join(packageRoot, 'oxlint.config.mjs')).href;
  await writeFile(
    path.join(mosaicRoot, 'oxlint.config.mjs'),
    `
import { createRequire } from 'node:module';
import config from ${JSON.stringify(configUrl)};
const require = createRequire(${JSON.stringify(path.join(packageRoot, 'package.json'))});
const resolvePlugin = plugin => typeof plugin === 'string'
  ? { name: plugin.replace(/^eslint-plugin-/, ''), specifier: require.resolve(plugin) }
  : { ...plugin, specifier: require.resolve(plugin.specifier) };
export default {
  ...config,
  jsPlugins: config.jsPlugins.map(resolvePlugin),
  overrides: config.overrides.map(override => ({
    ...override,
    ...(override.jsPlugins ? { jsPlugins: override.jsPlugins.map(resolvePlugin) } : {}),
  })),
  settings: { ...config.settings, 'boundaries/root-path': import.meta.dirname },
};
`,
  );
}, 30_000);

afterAll(async () => {
  if (mosaicRoot) {
    await rm(mosaicRoot, { recursive: true, force: true });
  }
});

async function lintAt(file, source) {
  const filePath = path.join(mosaicRoot, file);
  await mkdir(path.dirname(filePath), { recursive: true });
  const original = await readFile(filePath).catch(error => {
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  });
  await writeFile(filePath, source);
  try {
    const result = await execute(
      process.execPath,
      [
        oxlint,
        '--config',
        path.join(mosaicRoot, 'oxlint.config.mjs'),
        '--disable-nested-config',
        '--format',
        'json',
        '--threads',
        '1',
        filePath,
      ],
      {
        cwd: mosaicRoot,
        maxBuffer: 10 * 1024 * 1024,
      },
    ).catch(error => {
      if (error.code === 1 && error.stdout) {
        return error;
      }
      throw error;
    });
    if (!result.stdout.trimStart().startsWith('{')) {
      throw new Error(result.stdout);
    }
    return JSON.parse(result.stdout).diagnostics.map(diagnostic => ({
      message: diagnostic.message,
      ruleId: diagnostic.code
        .replace(/^([^()]+)\((.+)\)$/, '$1/$2')
        .replace(/^typescript\//, '@typescript-eslint/')
        .replace(/^eslint\//, ''),
      fatal: !diagnostic.code,
    }));
  } finally {
    if (original === undefined) {
      await rm(filePath);
    } else {
      await writeFile(filePath, original);
    }
  }
}

async function lint(file, source) {
  return lintAt(`${featureDir}/${file}`, source);
}

async function boundaryMessagesAt(file, source) {
  const messages = await lintAt(file, source);
  expect(messages.find(message => message.fatal)).toBeUndefined();
  return messages.filter(message => message.ruleId === 'boundaries/dependencies').map(message => message.message);
}

async function restrictedImports(file, source) {
  return boundaryMessagesAt(`${featureDir}/${file}`, source);
}

describe('Mosaic import boundaries', { timeout: 30_000 }, () => {
  test.each(['sample.view.ts', 'sample.view.tsx', 'sample.controller.ts', 'sample.controller.tsx'])(
    '%s rejects catalog values and Clerk hooks',
    async file => {
      const messages = await restrictedImports(
        file,
        [
          "import { reverificationMessages } from './reverification.messages';",
          "import { useUser as user } from '@clerk/shared/react';",
          "import { useMosaicRouter as router } from '../../hooks/use-mosaic-router';",
        ].join('\n'),
      );

      expect(messages).toHaveLength(3);
      expect(messages[0]).toContain('useMessages()');
      expect(messages[1]).toContain('model');
      expect(messages[2]).toContain('model');
    },
  );

  test('blocks both guards in the same view and accepts type-only catalog imports', async () => {
    const messages = await restrictedImports(
      'sample.view.tsx',
      [
        "import type { ReverificationMessageKey } from './reverification.messages';",
        "import { reverificationMessages } from './reverification.messages';",
        "import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';",
        "import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';",
      ].join('\n'),
    );

    expect(messages).toHaveLength(3);
    expect(messages[0]).toContain('useMessages()');
  });

  test('writes inline type-only imports as import type, so they stay type-only', async () => {
    const messages = await lint(
      'sample.view.tsx',
      "import { type ReverificationMessages } from './reverification.messages';",
    );
    expect(
      messages.filter(message => message.ruleId === '@typescript-eslint/no-import-type-side-effects'),
    ).toHaveLength(1);
  });

  test.each([
    'useClerk',
    'useUser',
    'useSession',
    'useSessionList',
    'useOrganization',
    'useOrganizationList',
    'useAuth',
  ])('rejects aliased %s from shared React in controllers', async name => {
    const messages = await restrictedImports(
      'sample.controller.ts',
      `import { ${name} as readClerk } from '@clerk/shared/react';`,
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('model');
  });

  test('rejects Clerk queries in views and controllers', async () => {
    for (const file of ['sample.view.tsx', 'sample.controller.ts']) {
      const messages = await restrictedImports(
        file,
        "import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
      );
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain('model');
    }
  });

  test.each(['sample.model.ts', 'sample.model.tsx'])(
    '%s sends React interaction state to the controller',
    async file => {
      const messages = await restrictedImports(file, "import { useState as state, useReducer } from 'react';");

      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain('controller');
    },
  );

  test('a model imports only types from its controller and view', async () => {
    expect(
      await restrictedImports(
        'sample.model.ts',
        [
          "import type { ReverificationController } from './reverification.controller';",
          "import type { ReverificationViewProps } from './reverification.view';",
        ].join('\n'),
      ),
    ).toEqual([]);

    const messages = await restrictedImports(
      'sample.model.ts',
      [
        "import { useReverificationController } from './reverification.controller';",
        "import { ReverificationView } from './reverification.view';",
      ].join('\n'),
    );
    expect(messages).toHaveLength(2);
    expect(messages.every(message => message.includes('plain data'))).toBe(true);
  });

  test('a controller imports only types from its view', async () => {
    expect(
      await restrictedImports(
        'sample.controller.ts',
        "import type { ReverificationViewProps } from './reverification.view';",
      ),
    ).toEqual([]);

    const messages = await restrictedImports(
      'sample.controller.ts',
      "import { ReverificationView } from './reverification.view';",
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('props');
  });

  test.each([
    "import React from 'react'; React.useState(0);",
    "import R from 'react'; R.useReducer(value => value, 0);",
    "import React from 'react'; React['useState'](0);",
    "import React from 'react'; const { useState: state } = React; state(0);",
    "import React from 'react'; const { ['useReducer']: reducer } = React;",
  ])('rejects state hooks through the React default binding: %s', async source => {
    const messages = await lint('sample.model.ts', source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    expect(messages.filter(message => message.ruleId === 'mosaic/no-model-react-state')).toEqual([
      expect.objectContaining({
        message: 'Put interaction state in the controller and pass its results to the view.',
      }),
    ]);
  });

  test.each([
    "import React from 'react'; React.useMemo(() => 0, []);",
    "import React from 'react'; export type Node = React.ReactNode;",
    "import React from 'react'; export type StateHook = typeof React.useState;",
    "import type React from 'react'; export type StateHook = typeof React.useState;",
    "import React from 'react'; function read(React) { return React.useState(0); }",
    'const React = { useState: value => value }; React.useState(0);',
    "import React from './other'; React.useState(0);",
    "import React from 'react'; const useState = 'useMemo'; React[useState](() => 0, []);",
    "import React from 'react'; const useState = 'useMemo'; const { [useState]: memo } = React;",
  ])('preserves unrelated React usage: %s', async source => {
    const messages = await lint('sample.model.ts', source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    expect(messages.filter(message => message.ruleId === 'mosaic/no-model-react-state')).toEqual([]);
  });

  test.each(['sample.view.ts', 'sample.view.tsx', 'sample.controller.ts', 'sample.controller.tsx'])(
    '%s rejects dynamic catalog imports once',
    async file => {
      for (const source of ["import('./reverification.messages');", 'import(`./reverification.messages.ts`);']) {
        const messages = await lint(file, source);
        expect(messages.find(message => message.fatal)).toBeUndefined();
        expect(messages.filter(message => message.ruleId === 'boundaries/dependencies')).toEqual([]);
        expect(messages.filter(message => message.ruleId === 'mosaic/no-dynamic-message-catalogs')).toEqual([
          expect.objectContaining({
            message: 'Use useMessages() for localized and overridden copy instead of importing catalog values.',
          }),
        ]);
      }
    },
  );

  test.each([
    ['sample.view.ts', "import('./reverification.controller');"],
    ['sample.controller.ts', 'import(`./reverification.model`);'],
    ['sample.view.ts', "export type Messages = typeof import('./reverification.messages');"],
    ['sample.model.ts', "import('./reverification.messages');"],
    ['sample.messages.ts', "import('./reverification.messages');"],
    ['sample.controller.ts', "import React from 'react'; React.useState(0);"],
  ])('preserves allowed imports in %s: %s', async (file, source) => {
    const messages = await lint(file, source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    expect(
      messages.filter(message =>
        ['mosaic/no-model-react-state', 'mosaic/no-dynamic-message-catalogs', 'boundaries/dependencies'].includes(
          message.ruleId,
        ),
      ),
    ).toEqual([]);
  });

  test('allows model Clerk hooks, controller state, catalog registration and shared utilities', async () => {
    expect(await restrictedImports('sample.model.ts', "import { useUser } from '@clerk/shared/react';")).toEqual([]);
    expect(
      await restrictedImports('sample.model.ts', "import { reverificationMessages } from './reverification.messages';"),
    ).toEqual([]);
    expect(
      await restrictedImports(
        'sample.model.ts',
        "import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
      ),
    ).toEqual([]);
    expect(await restrictedImports('sample.controller.ts', "import { useState } from 'react';")).toEqual([]);
    expect(
      await restrictedImports('sample.controller.ts', "import type { useUser } from '@clerk/shared/react';"),
    ).toEqual([]);
    expect(
      await restrictedImports('sample.controller.ts', "import { useReverification } from '@clerk/shared/react';"),
    ).toEqual([]);
    expect(
      await restrictedImports(
        'sample.messages.ts',
        "import { reverificationMessages } from './reverification.messages';",
      ),
    ).toEqual([]);
    expect(
      await restrictedImports('sample.view.tsx', "import { isClerkAPIResponseError } from '@clerk/shared/error';"),
    ).toEqual([]);
    expect(
      await restrictedImports(
        'sample.view.tsx',
        "import { useReverificationController } from './reverification.controller';",
      ),
    ).toEqual([]);
    expect(
      await restrictedImports('sample.view.tsx', "import { usePendingAction } from '../../hooks/use-pending-action';"),
    ).toEqual([]);
    expect(
      await restrictedImports('sample.view.tsx', "import type { CountryIso } from '@clerk/shared/phone';"),
    ).toEqual([]);
    expect(
      await restrictedImports('sample.view.tsx', "import type { ClerkAPIError } from '@clerk/shared/types';"),
    ).toEqual([]);
  });

  test('keeps the repository restriction on the shared package root', async () => {
    const messages = await lint(
      'sample.view.tsx',
      "import { useUser } from '@clerk/shared';\nimport { css } from '@emotion/react';",
    );
    expect(messages.filter(message => message.ruleId === 'no-restricted-imports')).toHaveLength(2);
  });
});

describe('Mosaic layers', { timeout: 30_000 }, () => {
  test.each([
    ['src/primitives/sample.ts', "import { Button } from '../components/button';"],
    ['src/primitives/sample.ts', "import { kebabCase } from '../utils/kebab-case';"],
    ['src/components/sample.tsx', "import { Reverification } from '../features/reverification';"],
    ['src/components/sample.tsx', "import { Confirmation } from '../blocks/confirmation';"],
    ['src/hooks/sample.ts', "import { useUserSessionsQuery } from '../queries/use-user-sessions-query';"],
    ['src/utils/sample.ts', "import { useModal } from '../modals/use-modal';"],
    ['src/localization/sample.ts', "import { Reverification } from '../features/reverification';"],
    ['src/modals/sample.ts', "import { Confirmation } from '../blocks/confirmation';"],
    ['src/blocks/sample.tsx', "import { UserButton } from '../features/user-button/user-button';"],
    ['src/queries/sample.ts', "import { Button } from '../components/button';"],
  ])('%s cannot import up: %s', async (file, source) => {
    const messages = await boundaryMessagesAt(file, source);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('down');
  });

  test.each([
    ['src/primitives/sample.ts', "import { Form } from './form';"],
    ['src/components/sample.tsx', "import { Form } from '../primitives/form';"],
    ['src/components/sample.tsx', "import { tokens } from '../tokens.stylex';"],
    ['src/hooks/sample.ts', "import type { TableHeaderCellProps } from '../components/table';"],
    ['src/utils/sample.ts', "import { feedbackStyles } from '../styles/feedback.styles';"],
    ['src/localization/sample.ts', "import { formMessages } from '../components/form/form.messages';"],
    [
      'src/localization/sample.ts',
      "import { apiKeysTableMessages } from '../features/api-keys/api-keys-table.messages';",
    ],
    ['src/modals/sample.ts', "import { setup } from '../machine/setup';"],
    ['src/blocks/sample.tsx', "import { Reverification } from '../features/reverification';"],
    ['src/blocks/sample.tsx', "import { autoUpdate } from '@floating-ui/react';"],
    [`${featureDir}/sample.view.tsx`, "import { Confirmation } from '../../blocks/confirmation';"],
    [`${featureDir}/sample.view.tsx`, "import { useModal } from '../../modals/use-modal';"],
    [`${featureDir}/sample.view.tsx`, "import { UserButton } from '../user-button/user-button';"],
    ['src/styles/index.ts', "export { UserButton } from '../features/user-button/user-button';"],
  ])('%s may import down or across: %s', async (file, source) => {
    expect(await boundaryMessagesAt(file, source)).toEqual([]);
  });
});

describe('Mosaic machines', { timeout: 30_000 }, () => {
  async function rawInvokeMessages(file, source) {
    const messages = await lintAt(file, source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    return messages.filter(message => message.ruleId === 'mosaic/no-raw-invoke').map(message => message.message);
  }

  test('rejects an invoke written without fromPromise', async () => {
    expect(
      await rawInvokeMessages(
        `${featureDir}/sample.controller.ts`,
        'export const state = { invoke: { src: () => Promise.resolve(1), onDone: { target: "idle" } } };',
      ),
    ).toEqual(['Write invoke with fromPromise from setup(), so onDone sees the typed output instead of any.']);
  });

  test.each([
    ['a quoted src key', 'export const state = { invoke: { "src": () => Promise.resolve(1) } };'],
    ['a quoted invoke key', 'export const state = { "invoke": { src: () => Promise.resolve(1) } };'],
    ['an as cast', 'export const state = { invoke: { src: () => Promise.resolve(1) } as object };'],
    ['satisfies', 'export const state = { invoke: { src: () => Promise.resolve(1) } satisfies object };'],
  ])('rejects a raw invoke written with %s', async (_name, source) => {
    expect(await rawInvokeMessages(`${featureDir}/sample.controller.ts`, source)).toHaveLength(1);
  });

  test('allows an invoke from fromPromise', async () => {
    expect(
      await rawInvokeMessages(
        `${featureDir}/sample.controller.ts`,
        'declare const fromPromise: (run: () => Promise<number>) => object;\nexport const state = { invoke: fromPromise(() => Promise.resolve(1)) };',
      ),
    ).toEqual([]);
  });

  test('ignores test files', async () => {
    expect(
      await rawInvokeMessages(testFixture, 'export const state = { invoke: { src: () => Promise.resolve(1) } };'),
    ).toEqual([]);
  });
});

describe('Mosaic parts', { timeout: 30_000 }, () => {
  async function forwardRefMessages(file, source) {
    const messages = await lintAt(
      file,
      ["import React from 'react';", "import { useRender } from './utils';", source].join('\n'),
    );
    expect(messages.find(message => message.fatal)).toBeUndefined();
    return messages.filter(message => message.ruleId === 'mosaic/forward-ref-parts').map(message => message.message);
  }

  test.each([
    "export function Part(props: { render?: never }) { return useRender({ defaultTagName: 'div', props }); }",
    "export const Part = (props: { render?: never }) => useRender({ defaultTagName: 'div', props });",
    "export function Part(props: { render?: never }) { return <Composite render={() => useRender({ defaultTagName: 'div', props })} />; }",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props) { return useRender({ defaultTagName: 'div', props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { const internalRef = React.useRef(null); return useRender({ defaultTagName: 'div', ref: internalRef, props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { const internalRef = React.useRef(null); return useRender({ defaultTagName: 'div', ref: [internalRef], props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref: null, props }); });",
  ])('rejects a part that drops the ref: %s', async source => {
    expect(await forwardRefMessages(partFixture, source)).toEqual([
      'Parts that render through useRender must use React.forwardRef and pass the ref to useRender (see primitives/select/select-trigger.tsx).',
    ]);
  });

  test.each([
    "export const Part = React.forwardRef<HTMLButtonElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'button', ref: [null, ref], props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref, props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref: [null, ref ?? null], props }); });",
    "export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props: { open?: boolean }, ref) { const finalRef = props.open ? ref : [null, ref]; return useRender({ defaultTagName: 'div', ref: finalRef, props }); });",
    'export function Provider(props: { children: React.ReactNode }) { return props.children; }',
  ])('allows parts that forward the ref or render nothing: %s', async source => {
    expect(await forwardRefMessages(partFixture, source)).toEqual([]);
  });

  test('ignores test files', async () => {
    expect(
      await forwardRefMessages(
        partTestFixture,
        "export function Part(props: { render?: never }) { return useRender({ defaultTagName: 'div', props }); }",
      ),
    ).toEqual([]);
  });
});

describe('Mosaic tests', { timeout: 30_000 }, () => {
  async function vitestRules(source) {
    const messages = await lintAt(
      testFixture,
      ["import { afterAll, beforeAll, describe, expect, test } from 'vitest';", source].join('\n'),
    );
    expect(messages.find(message => message.fatal)).toBeUndefined();
    return messages.map(message => message.ruleId).filter(rule => rule?.startsWith('vitest/'));
  }

  test.each([
    "test('adds', () => { expect(1 + 1).toBe(2); });",
    "function expectSum(sum) { expect(sum).toBe(2); }\ntest('adds', () => { expectSum(1 + 1); });",
  ])('accept a test that asserts: %s', async source => {
    expect(await vitestRules(source)).toEqual([]);
  });

  test.each([
    ['vitest/no-focused-tests', "test.only('adds', () => { expect(1 + 1).toBe(2); });"],
    ['vitest/expect-expect', "test('adds', () => { void (1 + 1); });"],
    [
      'vitest/no-identical-title',
      "describe('math', () => { test('adds', () => { expect(1).toBe(1); }); test('adds', () => { expect(2).toBe(2); }); });",
    ],
  ])('report %s', async (rule, source) => {
    expect(await vitestRules(source)).toContain(rule);
  });
});

describe('Mosaic effects', { timeout: 30_000 }, () => {
  async function effectRules(body) {
    const messages = await lintAt(
      'src/features/reverification/sample.view.tsx',
      [
        "import { useEffect, useState } from 'react';",
        'export function FullName({ first, last }: { first: string; last: string }) {',
        body,
        '  return <span>{fullName}</span>;',
        '}',
      ].join('\n'),
    );
    expect(messages.find(message => message.fatal)).toBeUndefined();
    return messages
      .map(message => message.ruleId)
      .filter(rule => rule?.startsWith('react-you-might-not-need-an-effect/'));
  }

  test('reject state derived in an effect', async () => {
    expect(
      await effectRules(
        [
          "  const [fullName, setFullName] = useState('');",
          '  useEffect(() => {',
          '    setFullName(`${first} ${last}`);',
          '  }, [first, last]);',
        ].join('\n'),
      ),
    ).toContain('react-you-might-not-need-an-effect/no-derived-state');
  });

  test.each([
    ['src/features/reverification/sample.controller.ts', ['react-you-might-not-need-an-effect/no-event-handler']],
    ['src/hooks/sample.ts', []],
    ['src/primitives/sample.ts', []],
  ])('%s reports an effect used as an event handler: %j', async (file, expected) => {
    const messages = await lintAt(
      file,
      [
        "import { useEffect } from 'react';",
        'export function useOnOpen(open: boolean, onOpen: () => void) {',
        '  useEffect(() => {',
        '    if (open) {',
        '      onOpen();',
        '    }',
        '  }, [open, onOpen]);',
        '}',
      ].join('\n'),
    );
    expect(messages.find(message => message.fatal)).toBeUndefined();
    expect(
      messages
        .map(message => message.ruleId)
        .filter(rule => rule === 'react-you-might-not-need-an-effect/no-event-handler'),
    ).toEqual(expected);
  });

  test('accept state derived during render', async () => {
    expect(await effectRules('  const fullName = `${first} ${last}`;\n  void useState; void useEffect;')).toEqual([]);
  });
});

describe('Mosaic clock reads', { timeout: 30_000 }, () => {
  async function renderClockMessages(file, source) {
    const messages = await lintAt(file, source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    return messages.filter(message => message.ruleId === 'mosaic/no-render-clock').map(message => message.message);
  }

  test('rejects a clock read in a hook body', async () => {
    expect(
      await renderClockMessages('src/hooks/sample.ts', 'export function useSample() { return Date.now(); }'),
    ).toEqual([
      'Read the current time with useNow during render, so the server and the client agree. Date.now() and new Date() belong in effects, event handlers and machine actions.',
    ]);
  });

  test.each([
    ['a component body', 'export function Sample() { const now = new Date(); return now.getTime(); }'],
    ['an arrow hook', 'export const useSample = () => Date.now();'],
    [
      'a useState initializer',
      "import { useState } from 'react';\nexport function useSample() { return useState(() => Date.now())[0]; }",
    ],
    [
      'a useMemo callback',
      "import { useMemo } from 'react';\nexport function useSample() { return useMemo(() => new Date(), []); }",
    ],
    ['a useRef value', "import { useRef } from 'react';\nexport function useSample() { return useRef(Date.now()); }"],
    ['a map callback', 'export function useSample(items: number[]) { return items.map(item => item - Date.now()); }'],
    [
      'a forwardRef render',
      "import { forwardRef } from 'react';\nexport const Sample = forwardRef(() => { void Date.now(); return null; });",
    ],
  ])('rejects a clock read in %s', async (_name, source) => {
    expect(await renderClockMessages('src/hooks/sample.ts', source)).toHaveLength(1);
  });

  test.each([
    [
      'an effect',
      "import { useEffect } from 'react';\nexport function useSample() { useEffect(() => { void Date.now(); }, []); }",
    ],
    [
      'a useCallback',
      "import { useCallback } from 'react';\nexport function useSample() { return useCallback(() => Date.now(), []); }",
    ],
    ['an event handler', 'export function useSample() { return { onClick: () => new Date() }; }'],
    ['a plain function', 'export function unlockTime(seconds: number) { return Date.now() + seconds * 1000; }'],
    ['a parsed date', 'export function useSample(value: string) { return new Date(value); }'],
  ])('allows a clock read in %s', async (_name, source) => {
    expect(await renderClockMessages('src/hooks/sample.ts', source)).toEqual([]);
  });

  test.each(['src/hooks/use-now.ts', 'src/mosaic-provider.tsx'])('allows the shared clock in %s', async file => {
    expect(await renderClockMessages(file, 'export function useSample() { return Date.now(); }')).toEqual([]);
  });

  test('ignores test files', async () => {
    expect(await renderClockMessages(testFixture, 'export function useSample() { return Date.now(); }')).toEqual([]);
  });
});

describe('Mosaic package configuration', () => {
  test('inherits repository rules and keeps Mosaic guards in the package', async () => {
    const configAt = async cwd => {
      const { stdout } = await execute(process.execPath, [oxlint, '-c', 'oxlint.config.mjs', '--print-config'], {
        cwd,
      });
      return JSON.parse(stdout);
    };
    const rootConfig = await configAt(path.resolve(packageRoot, '../..'));
    const mosaicConfig = await configAt(packageRoot);
    expect(mosaicConfig.rules['no-restricted-imports']).toEqual(rootConfig.rules['no-restricted-imports']);
    const rootRules = [rootConfig.rules, ...rootConfig.overrides.map(override => override.rules)];
    for (const rules of rootRules) {
      expect(Object.keys(rules).some(rule => /^(mosaic|boundaries)\//.test(rule))).toBe(false);
    }
    expect(mosaicConfig.overrides.some(override => override.rules['boundaries/dependencies'])).toBe(true);
  });
});

describe('Mosaic migration coverage', { timeout: 30_000 }, () => {
  test.each([
    ['@typescript-eslint/no-floating-promises', 'export function load(fetch: () => Promise<void>) { fetch(); }'],
    ['@typescript-eslint/consistent-type-assertions', 'export const value = 1 as number;'],
    ['eslint-compat/no-restricted-syntax', 'export function View() { return <form />; }'],
    [
      '@stylexjs/enforce-extension',
      "import * as stylex from '@stylexjs/stylex'; export const tokens = stylex.defineVars({ color: 'red' });",
    ],
  ])('preserves %s', async (rule, source) => {
    const messages = await lint('sample.view.tsx', source);
    expect(messages.some(message => message.ruleId === rule)).toBe(true);
  });
});
