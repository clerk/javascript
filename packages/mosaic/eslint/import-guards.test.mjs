import path from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../..');
const mosaicRoot = path.resolve(import.meta.dirname, '..');
const rootEslint = new ESLint({ cwd: root });
const eslint = new ESLint({
  cwd: mosaicRoot,
  overrideConfig: {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'packages/mosaic/src/features/sample.view.ts',
            'packages/mosaic/src/features/sample.view.tsx',
            'packages/mosaic/src/features/sample.controller.ts',
            'packages/mosaic/src/features/sample.controller.tsx',
            'packages/mosaic/src/features/sample.model.ts',
            'packages/mosaic/src/features/sample.model.tsx',
            'packages/mosaic/src/features/sample.messages.ts',
          ],
        },
      },
    },
  },
});

async function lint(file, source) {
  const [result] = await eslint.lintText(source, { filePath: path.join(mosaicRoot, 'src/features', file) });
  return result.messages;
}

async function restrictedImports(file, source) {
  const messages = await lint(file, source);
  expect(messages.find(message => message.fatal)).toBeUndefined();
  return messages
    .filter(message => message.ruleId === '@typescript-eslint/no-restricted-imports')
    .map(message => message.message);
}

describe('Mosaic import boundaries', { timeout: 30_000 }, () => {
  test.each(['sample.view.ts', 'sample.view.tsx', 'sample.controller.ts', 'sample.controller.tsx'])(
    '%s rejects catalog values and Clerk hooks',
    async file => {
      const messages = await restrictedImports(
        file,
        [
          "import { messages } from './sample.messages';",
          "import { useUser as user } from '@clerk/shared/react';",
          "import { useMosaicRouter as router } from '@/hooks/use-mosaic-router';",
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
        "import type { MessageKey } from '@/features/sample.messages.ts';",
        "import { type OtherMessageKey } from './sample.messages';",
        "import { messages } from '@/features/sample.messages.ts';",
        "import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment.ts';",
        "import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';",
      ].join('\n'),
    );

    expect(messages).toHaveLength(3);
    expect(messages[0]).toContain('useMessages()');
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

  test.each(['sample.model.ts', 'sample.model.tsx'])(
    '%s sends React interaction state to the controller',
    async file => {
      const messages = await restrictedImports(file, "import { useState as state, useReducer } from 'react';");

      expect(messages).toHaveLength(2);
      expect(messages.every(message => message.includes('controller'))).toBe(true);
    },
  );

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
        messageId: 'controllerState',
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
    '%s rejects dynamic catalog imports',
    async file => {
      for (const source of ["import('./sample.messages');", 'import(`@/features/sample.messages.ts`);']) {
        const messages = await lint(file, source);
        expect(messages.find(message => message.fatal)).toBeUndefined();
        expect(messages.filter(message => message.ruleId === 'mosaic/no-dynamic-message-catalogs')).toEqual([
          expect.objectContaining({
            message: 'Use useMessages() for localized and overridden copy instead of importing catalog values.',
            messageId: 'useMessages',
          }),
        ]);
      }
    },
  );

  test.each([
    ['sample.view.ts', "import('./sample.controller');"],
    ['sample.controller.ts', 'import(`./sample.model`);'],
    ['sample.view.ts', "export type Messages = typeof import('./sample.messages');"],
    ['sample.model.ts', "import('./sample.messages');"],
    ['sample.messages.ts', "import('./other.messages');"],
    ['sample.controller.ts', "import React from 'react'; React.useState(0);"],
  ])('preserves allowed imports in %s: %s', async (file, source) => {
    const messages = await lint(file, source);
    expect(messages.find(message => message.fatal)).toBeUndefined();
    expect(
      messages.filter(message =>
        ['mosaic/no-model-react-state', 'mosaic/no-dynamic-message-catalogs'].includes(message.ruleId),
      ),
    ).toEqual([]);
  });

  test('allows model Clerk hooks, controller state, catalog registration and shared utilities', async () => {
    expect(await restrictedImports('sample.model.ts', "import { useUser } from '@clerk/shared/react';")).toEqual([]);
    expect(await restrictedImports('sample.model.ts', "import { messages } from './sample.messages';")).toEqual([]);
    expect(await restrictedImports('sample.controller.ts', "import { useState } from 'react';")).toEqual([]);
    expect(
      await restrictedImports('sample.controller.ts', "import type { useUser } from '@clerk/shared/react';"),
    ).toEqual([]);
    expect(await restrictedImports('sample.messages.ts', "import { messages } from './other.messages';")).toEqual([]);
    expect(
      await restrictedImports('sample.view.tsx', "import { isClerkAPIResponseError } from '@clerk/shared/error';"),
    ).toEqual([]);
    expect(await restrictedImports('sample.view.tsx', "import { useController } from './sample.controller';")).toEqual(
      [],
    );
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

describe('Mosaic package configuration', { timeout: 30_000 }, () => {
  test.each([
    'src/features/sample.view.tsx',
    'src/features/sample.controller.ts',
    'src/features/sample.model.ts',
    'src/styles/sample.styles.ts',
    'src/primitives/sample.tsx',
  ])('%s inherits repository rules without enabling guards at the root', async file => {
    const filePath = path.join(mosaicRoot, file);
    const rootConfig = await rootEslint.calculateConfigForFile(filePath);
    const mosaicConfig = await eslint.calculateConfigForFile(filePath);
    const inheritedRules = { ...mosaicConfig.rules };

    for (const rule of [
      '@typescript-eslint/no-restricted-imports',
      'mosaic/no-model-react-state',
      'mosaic/no-dynamic-message-catalogs',
    ]) {
      expect(rootConfig.rules[rule]).toBeUndefined();
      delete inheritedRules[rule];
    }

    expect(inheritedRules).toEqual(rootConfig.rules);
  });
});
