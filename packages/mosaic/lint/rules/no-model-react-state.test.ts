import { RuleTester } from 'oxlint/plugins-dev';

import { noModelReactState } from './no-model-react-state.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('no-model-react-state', noModelReactState, {
  valid: [
    "import React from 'react'; React.useMemo(() => 0, []);",
    "import React from 'react'; export type Node = React.ReactNode;",
    "import React from 'react'; export type StateHook = typeof React.useState;",
    "import type React from 'react'; export type StateHook = typeof React.useState;",
    "import React from 'react'; function read(React) { return React.useState(0); }",
    'const React = { useState: value => value }; React.useState(0);',
    "import React from './other'; React.useState(0);",
    "import React from 'react'; const useState = 'useMemo'; React[useState](() => 0, []);",
    "import React from 'react'; const useState = 'useMemo'; const { [useState]: memo } = React;",
  ],
  invalid: [
    { code: "import React from 'react'; React.useState(0);", errors: [{ messageId: 'controllerState' }] },
    { code: "import R from 'react'; R.useReducer(value => value, 0);", errors: [{ messageId: 'controllerState' }] },
    { code: "import React from 'react'; React['useState'](0);", errors: [{ messageId: 'controllerState' }] },
    {
      code: "import React from 'react'; const { useState: state } = React; state(0);",
      errors: [{ messageId: 'controllerState' }],
    },
    {
      code: "import React from 'react'; const { ['useReducer']: reducer } = React;",
      errors: [{ messageId: 'controllerState' }],
    },
  ],
});
