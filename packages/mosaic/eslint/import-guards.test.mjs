import path from 'node:path';

import { ESLint } from 'eslint';
import noUnneededEffects from 'eslint-plugin-react-you-might-not-need-an-effect';
import { describe, expect, test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../..');
const mosaicRoot = path.resolve(import.meta.dirname, '..');
const featureDir = 'src/features/reverification';
const layerFixtures = [
  'src/primitives/sample.ts',
  'src/components/sample.tsx',
  'src/hooks/sample.ts',
  'src/utils/sample.ts',
  'src/localization/sample.ts',
  'src/modals/sample.ts',
  'src/blocks/sample.tsx',
  'src/queries/sample.ts',
];
const flowFixtures = [
  'sample.view.ts',
  'sample.view.tsx',
  'sample.controller.ts',
  'sample.controller.tsx',
  'sample.model.ts',
  'sample.model.tsx',
  'sample.messages.ts',
].map(file => `${featureDir}/${file}`);
const testFixture = 'src/hooks/__tests__/sample.test.ts';
const partFixture = 'src/primitives/sample-part.tsx';
const partTestFixture = 'src/primitives/__tests__/sample-part.test.tsx';
const rootEslint = new ESLint({ cwd: root });
const eslint = new ESLint({
  cwd: mosaicRoot,
  overrideConfig: {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [...flowFixtures, ...layerFixtures, testFixture, partFixture, partTestFixture].map(
            file => `packages/mosaic/${file}`,
          ),
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 32,
        },
      },
    },
  },
});

async function lintAt(file, source) {
  const [result] = await eslint.lintText(source, { filePath: path.join(mosaicRoot, file) });
  return result.messages;
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
    '%s rejects dynamic catalog imports once',
    async file => {
      for (const source of ["import('./reverification.messages');", 'import(`./reverification.messages.ts`);']) {
        const messages = await lint(file, source);
        expect(messages.find(message => message.fatal)).toBeUndefined();
        expect(messages.filter(message => message.ruleId === 'boundaries/dependencies')).toEqual([]);
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
    const messages = await lintAt(testFixture, ["import { describe, expect, test } from 'vitest';", source].join('\n'));
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
      'boundaries/dependencies',
      'mosaic/no-model-react-state',
      'mosaic/no-dynamic-message-catalogs',
      'mosaic/forward-ref-parts',
      '@typescript-eslint/no-import-type-side-effects',
      ...Object.keys(noUnneededEffects.configs.strict.rules),
    ]) {
      expect(rootConfig.rules[rule]).toBeUndefined();
      delete inheritedRules[rule];
    }

    expect(inheritedRules).toEqual(rootConfig.rules);
  });
});
