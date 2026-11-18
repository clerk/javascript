import { RuleTester } from 'oxlint/plugins-dev';

import plugin from '../plugin.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('no-dynamic-message-catalogs', plugin.rules['no-dynamic-message-catalogs'], {
  valid: [
    "import('./reverification.controller');",
    'import(`./reverification.model`);',
    "export type Messages = typeof import('./reverification.messages');",
    "import React from 'react'; React.useState(0);",
  ],
  invalid: [
    {
      code: "import('./reverification.messages');",
      errors: [{ message: /^Read copy with `useMessages\('<namespace>'\)` from src\/localization/ }],
    },
    { code: 'import(`./reverification.messages.ts`);', errors: [{ messageId: 'useMessages' }] },
  ],
});
