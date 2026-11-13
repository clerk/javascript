import { createRequire } from 'node:module';
import path from 'node:path';

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, test } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = test;

const require = createRequire(import.meta.url);
const config = require('../../oxlint.config.mjs').default;
const ruleTester = new RuleTester({ cwd: path.resolve(import.meta.dirname, '../..') });

const boundaries = require('eslint-plugin-boundaries');
const options = config.overrides
  .find(override => override.rules['boundaries/dependencies'])
  .rules['boundaries/dependencies'].slice(1);

ruleTester.run('dependencies', boundaries.rules.dependencies, {
  valid: [
    {
      name: "sample.view.ts leaves dynamic catalogs to the custom rule: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.view.ts',
      code: "import('./reverification.messages');",
    },
    {
      name: 'sample.view.ts leaves dynamic catalogs to the custom rule: import(`./reverification.messages.ts`);',
      filename: 'src/features/reverification/sample.view.ts',
      code: 'import(`./reverification.messages.ts`);',
    },
    {
      name: "sample.view.tsx leaves dynamic catalogs to the custom rule: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import('./reverification.messages');",
    },
    {
      name: 'sample.view.tsx leaves dynamic catalogs to the custom rule: import(`./reverification.messages.ts`);',
      filename: 'src/features/reverification/sample.view.tsx',
      code: 'import(`./reverification.messages.ts`);',
    },
    {
      name: "sample.controller.ts leaves dynamic catalogs to the custom rule: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import('./reverification.messages');",
    },
    {
      name: 'sample.controller.ts leaves dynamic catalogs to the custom rule: import(`./reverification.messages.ts`);',
      filename: 'src/features/reverification/sample.controller.ts',
      code: 'import(`./reverification.messages.ts`);',
    },
    {
      name: "sample.controller.tsx leaves dynamic catalogs to the custom rule: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.controller.tsx',
      code: "import('./reverification.messages');",
    },
    {
      name: 'sample.controller.tsx leaves dynamic catalogs to the custom rule: import(`./reverification.messages.ts`);',
      filename: 'src/features/reverification/sample.controller.tsx',
      code: 'import(`./reverification.messages.ts`);',
    },
    {
      name: 'allows controller and view types in a model',
      filename: 'src/features/reverification/sample.model.ts',
      code: `
        import type { ReverificationController } from './reverification.controller';
        import type { ReverificationViewProps } from './reverification.view';
      `,
    },
    {
      name: 'allows view types in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import type { ReverificationViewProps } from './reverification.view';",
    },
    {
      name: "allows imports in sample.view.ts: import('./reverification.controller');",
      filename: 'src/features/reverification/sample.view.ts',
      code: "import('./reverification.controller');",
    },
    {
      name: 'allows imports in sample.controller.ts: import(`./reverification.model`);',
      filename: 'src/features/reverification/sample.controller.ts',
      code: 'import(`./reverification.model`);',
    },
    {
      name: "allows imports in sample.view.ts: export type Messages = typeof import('./reverification.messages');",
      filename: 'src/features/reverification/sample.view.ts',
      code: "export type Messages = typeof import('./reverification.messages');",
    },
    {
      name: "allows imports in sample.model.ts: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.model.ts',
      code: "import('./reverification.messages');",
    },
    {
      name: "allows imports in sample.messages.ts: import('./reverification.messages');",
      filename: 'src/features/reverification/sample.messages.ts',
      code: "import('./reverification.messages');",
    },
    {
      name: "allows imports in sample.controller.ts: import React from 'react'; React.useState(0);",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import React from 'react'; React.useState(0);",
    },
    {
      name: "allows sample.model.ts: import { useUser } from '@clerk/shared/react';",
      filename: 'src/features/reverification/sample.model.ts',
      code: "import { useUser } from '@clerk/shared/react';",
    },
    {
      name: "allows sample.model.ts: import { reverificationMessages } from './reverification.messages';",
      filename: 'src/features/reverification/sample.model.ts',
      code: "import { reverificationMessages } from './reverification.messages';",
    },
    {
      name: "allows sample.model.ts: import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
      filename: 'src/features/reverification/sample.model.ts',
      code: "import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
    },
    {
      name: "allows sample.controller.ts: import { useState } from 'react';",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useState } from 'react';",
    },
    {
      name: "allows sample.controller.ts: import type { useUser } from '@clerk/shared/react';",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import type { useUser } from '@clerk/shared/react';",
    },
    {
      name: "allows sample.controller.ts: import { useReverification } from '@clerk/shared/react';",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useReverification } from '@clerk/shared/react';",
    },
    {
      name: "allows sample.messages.ts: import { reverificationMessages } from './reverification.messages';",
      filename: 'src/features/reverification/sample.messages.ts',
      code: "import { reverificationMessages } from './reverification.messages';",
    },
    {
      name: "allows sample.view.tsx: import { isClerkAPIResponseError } from '@clerk/shared/error';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { isClerkAPIResponseError } from '@clerk/shared/error';",
    },
    {
      name: "allows sample.view.tsx: import { useReverificationController } from './reverification.controller';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { useReverificationController } from './reverification.controller';",
    },
    {
      name: "allows sample.view.tsx: import { usePendingAction } from '../../hooks/use-pending-action';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { usePendingAction } from '../../hooks/use-pending-action';",
    },
    {
      name: "allows sample.view.tsx: import type { CountryIso } from '@clerk/shared/phone';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import type { CountryIso } from '@clerk/shared/phone';",
    },
    {
      name: "allows sample.view.tsx: import type { ClerkAPIError } from '@clerk/shared/types';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import type { ClerkAPIError } from '@clerk/shared/types';",
    },
    {
      name: "src/primitives/sample.ts may import down or across: import { Form } from './form';",
      filename: 'src/primitives/sample.ts',
      code: "import { Form } from './form';",
    },
    {
      name: "src/components/sample.tsx may import down or across: import { Form } from '../primitives/form';",
      filename: 'src/components/sample.tsx',
      code: "import { Form } from '../primitives/form';",
    },
    {
      name: "src/components/sample.tsx may import down or across: import { tokens } from '../tokens.stylex';",
      filename: 'src/components/sample.tsx',
      code: "import { tokens } from '../tokens.stylex';",
    },
    {
      name: "src/hooks/sample.ts may import down or across: import type { TableHeaderCellProps } from '../components/table';",
      filename: 'src/hooks/sample.ts',
      code: "import type { TableHeaderCellProps } from '../components/table';",
    },
    {
      name: "src/utils/sample.ts may import down or across: import { feedbackStyles } from '../styles/feedback.styles';",
      filename: 'src/utils/sample.ts',
      code: "import { feedbackStyles } from '../styles/feedback.styles';",
    },
    {
      name: "src/localization/sample.ts may import down or across: import { formMessages } from '../components/form/form.messages';",
      filename: 'src/localization/sample.ts',
      code: "import { formMessages } from '../components/form/form.messages';",
    },
    {
      name: "src/localization/sample.ts may import down or across: import { apiKeysTableMessages } from '../features/api-keys/api-keys-table.messages';",
      filename: 'src/localization/sample.ts',
      code: "import { apiKeysTableMessages } from '../features/api-keys/api-keys-table.messages';",
    },
    {
      name: "src/modals/sample.ts may import down or across: import { setup } from '../machine/setup';",
      filename: 'src/modals/sample.ts',
      code: "import { setup } from '../machine/setup';",
    },
    {
      name: "src/modals/sample.ts may import down or across: import { useMosaicLocation } from '../routing/use-mosaic-location';",
      filename: 'src/modals/sample.ts',
      code: "import { useMosaicLocation } from '../routing/use-mosaic-location';",
    },
    {
      name: "src/features/reverification/sample.controller.ts may import down or across: import { useRouterScope } from '../../routing/use-router';",
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useRouterScope } from '../../routing/use-router';",
    },
    {
      name: "src/blocks/sample.tsx may import down or across: import { Reverification } from '../features/reverification';",
      filename: 'src/blocks/sample.tsx',
      code: "import { Reverification } from '../features/reverification';",
    },
    {
      name: "src/blocks/sample.tsx may import down or across: import { autoUpdate } from '@floating-ui/react';",
      filename: 'src/blocks/sample.tsx',
      code: "import { autoUpdate } from '@floating-ui/react';",
    },
    {
      name: "src/features/reverification/sample.view.tsx may import down or across: import { Confirmation } from '../../blocks/confirmation';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { Confirmation } from '../../blocks/confirmation';",
    },
    {
      name: "src/features/reverification/sample.view.tsx may import down or across: import { useModal } from '../../modals/use-modal';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { useModal } from '../../modals/use-modal';",
    },
    {
      name: "src/features/reverification/sample.view.tsx may import down or across: import { UserButton } from '../user-button/user-button';",
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { UserButton } from '../user-button/user-button';",
    },
    {
      name: "src/styles/index.ts may import down or across: export { UserButton } from '../features/user-button/user-button';",
      filename: 'src/styles/index.ts',
      code: "export { UserButton } from '../features/user-button/user-button';",
    },
  ].map(testCase => ({ ...testCase, options, settings: config.settings })),
  invalid: [
    {
      name: 'sample.view.ts rejects catalog values and Clerk hooks',
      filename: 'src/features/reverification/sample.view.ts',
      code: `
        import { reverificationMessages } from './reverification.messages';
        import { useUser as user } from '@clerk/shared/react';
        import { useMosaicRouter as router } from '../../hooks/use-mosaic-router';
      `,
      errors: [/^Read copy with `useMessages\('<namespace>'\)` from src\/localization/, /model/, /model/],
    },
    {
      name: 'sample.view.tsx rejects catalog values and Clerk hooks',
      filename: 'src/features/reverification/sample.view.tsx',
      code: `
        import { reverificationMessages } from './reverification.messages';
        import { useUser as user } from '@clerk/shared/react';
        import { useMosaicRouter as router } from '../../hooks/use-mosaic-router';
      `,
      errors: [/^Read copy with `useMessages\('<namespace>'\)` from src\/localization/, /model/, /model/],
    },
    {
      name: 'sample.controller.ts rejects catalog values and Clerk hooks',
      filename: 'src/features/reverification/sample.controller.ts',
      code: `
        import { reverificationMessages } from './reverification.messages';
        import { useUser as user } from '@clerk/shared/react';
        import { useMosaicRouter as router } from '../../hooks/use-mosaic-router';
      `,
      errors: [/^Read copy with `useMessages\('<namespace>'\)` from src\/localization/, /model/, /model/],
    },
    {
      name: 'sample.controller.tsx rejects catalog values and Clerk hooks',
      filename: 'src/features/reverification/sample.controller.tsx',
      code: `
        import { reverificationMessages } from './reverification.messages';
        import { useUser as user } from '@clerk/shared/react';
        import { useMosaicRouter as router } from '../../hooks/use-mosaic-router';
      `,
      errors: [/^Read copy with `useMessages\('<namespace>'\)` from src\/localization/, /model/, /model/],
    },
    {
      name: 'rejects catalog values and environment hooks but allows catalog types',
      filename: 'src/features/reverification/sample.view.tsx',
      code: `
        import type { ReverificationMessageKey } from './reverification.messages';
        import { reverificationMessages } from './reverification.messages';
        import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
        import { useMosaicSupportEmail } from '../../hooks/use-mosaic-support-email';
      `,
      errors: [/^Read copy with `useMessages\('<namespace>'\)` from src\/localization/, /model/, /model/],
    },
    {
      name: 'rejects aliased useClerk in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useClerk as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useUser in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useUser as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useSession in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useSession as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useSessionList in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useSessionList as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useOrganization in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useOrganization as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useOrganizationList in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useOrganizationList as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects aliased useAuth in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useAuth as readClerk } from '@clerk/shared/react';",
      errors: [/model/],
    },
    {
      name: 'rejects Clerk queries in sample.view.tsx',
      filename: 'src/features/reverification/sample.view.tsx',
      code: "import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
      errors: [/model/],
    },
    {
      name: 'rejects Clerk queries in sample.controller.ts',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { useUserSessionsQuery } from '../../queries/use-user-sessions-query';",
      errors: [/model/],
    },
    {
      name: 'sample.model.ts rejects interaction state',
      filename: 'src/features/reverification/sample.model.ts',
      code: "import { useState as state, useReducer } from 'react';",
      errors: [/controller/],
    },
    {
      name: 'sample.model.tsx rejects interaction state',
      filename: 'src/features/reverification/sample.model.tsx',
      code: "import { useState as state, useReducer } from 'react';",
      errors: [/controller/],
    },
    {
      name: 'rejects controller and view values in a model',
      filename: 'src/features/reverification/sample.model.ts',
      code: `
        import { useReverificationController } from './reverification.controller';
        import { ReverificationView } from './reverification.view';
      `,
      errors: [/plain data/, /plain data/],
    },
    {
      name: 'rejects view values in a controller',
      filename: 'src/features/reverification/sample.controller.ts',
      code: "import { ReverificationView } from './reverification.view';",
      errors: [/props/],
    },
    {
      name: "src/primitives/sample.ts cannot import up: import { Button } from '../components/button';",
      filename: 'src/primitives/sample.ts',
      code: "import { Button } from '../components/button';",
      errors: [/down/],
    },
    {
      name: "src/primitives/sample.ts cannot import up: import { kebabCase } from '../utils/kebab-case';",
      filename: 'src/primitives/sample.ts',
      code: "import { kebabCase } from '../utils/kebab-case';",
      errors: [/down/],
    },
    {
      name: "src/components/sample.tsx cannot import up: import { Reverification } from '../features/reverification';",
      filename: 'src/components/sample.tsx',
      code: "import { Reverification } from '../features/reverification';",
      errors: [/down/],
    },
    {
      name: "src/components/sample.tsx cannot import up: import { Confirmation } from '../blocks/confirmation';",
      filename: 'src/components/sample.tsx',
      code: "import { Confirmation } from '../blocks/confirmation';",
      errors: [/down/],
    },
    {
      name: "src/hooks/sample.ts cannot import up: import { useUserSessionsQuery } from '../queries/use-user-sessions-query';",
      filename: 'src/hooks/sample.ts',
      code: "import { useUserSessionsQuery } from '../queries/use-user-sessions-query';",
      errors: [/down/],
    },
    {
      name: "src/utils/sample.ts cannot import up: import { useModal } from '../modals/use-modal';",
      filename: 'src/utils/sample.ts',
      code: "import { useModal } from '../modals/use-modal';",
      errors: [/down/],
    },
    {
      name: "src/localization/sample.ts cannot import up: import { Reverification } from '../features/reverification';",
      filename: 'src/localization/sample.ts',
      code: "import { Reverification } from '../features/reverification';",
      errors: [/down/],
    },
    {
      name: "src/modals/sample.ts cannot import up: import { Confirmation } from '../blocks/confirmation';",
      filename: 'src/modals/sample.ts',
      code: "import { Confirmation } from '../blocks/confirmation';",
      errors: [/down/],
    },
    {
      name: "src/blocks/sample.tsx cannot import up: import { UserButton } from '../features/user-button/user-button';",
      filename: 'src/blocks/sample.tsx',
      code: "import { UserButton } from '../features/user-button/user-button';",
      errors: [/down/],
    },
    {
      name: "src/queries/sample.ts cannot import up: import { Button } from '../components/button';",
      filename: 'src/queries/sample.ts',
      code: "import { Button } from '../components/button';",
      errors: [/down/],
    },
    {
      name: "src/routing/sample.ts cannot import up: import { ModalHost } from '../modals/modal-host';",
      filename: 'src/routing/sample.ts',
      code: "import { ModalHost } from '../modals/modal-host';",
      errors: [/down/],
    },
    {
      name: "src/components/sample.tsx cannot import up: import { useRouter } from '../routing/use-router';",
      filename: 'src/components/sample.tsx',
      code: "import { useRouter } from '../routing/use-router';",
      errors: [/down/],
    },
  ].map(testCase => ({ ...testCase, options, settings: config.settings })),
});
