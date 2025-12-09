export const fixtures = [
  {
    name: 'Renames unstable hooks and handlers to internal',
    source: `
const clerk = useClerk();
clerk.__unstable__updateProps({});
window.__unstable__onAfterSetActive = () => {};
const opts = { __unstable_invokeMiddlewareOnAuthStateChange: true };
const handler = client['__unstable__onAfterResponse'];
    `,
    output: `
const clerk = useClerk();
clerk.__internal_updateProps({});
window.__internal_onAfterSetActive = () => {};
const opts = { __internal_invokeMiddlewareOnAuthStateChange: true };
const handler = client["__internal_onAfterResponse"];
`,
  },
  {
    name: 'Moves UI theme helpers to experimental path and renames identifiers',
    source: `
import { __experimental_createTheme, experimental__simple, Button } from '@clerk/ui';

const theme = __experimental_createTheme();
const kind = experimental__simple;
    `,
    output: `
import { Button } from '@clerk/ui';

import { createTheme, simple } from "@clerk/ui/themes/experimental";

const theme = createTheme();
const kind = simple;
`,
  },
  {
    name: 'Moves UI theme helpers required from root to experimental path',
    source: `
const { __experimental_createTheme, experimental__simple, Card } = require('@clerk/ui');
    `,
    output: `
const {
  Card
} = require('@clerk/ui');

const {
  createTheme,
  simple
} = require("@clerk/ui/themes/experimental");
`,
  },
  {
    name: 'Moves chrome extension client creation to background path',
    source: `
import { __unstable__createClerkClient } from '@clerk/chrome-extension';

__unstable__createClerkClient();
    `,
    output: `
import { createClerkClient } from "@clerk/chrome-extension/background";

createClerkClient();
`,
  },
  {
    name: 'Removes deprecated billing props from JSX',
    source: `
<OrganizationProfile __unstable_manageBillingUrl="url" experimental__forceOauthFirst />;
    `,
    output: `
<OrganizationProfile />;
`,
  },
  {
    name: 'Does not rename class constructors',
    source: `
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
  }
}
    `,
    output: `
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
  }
}
`,
  },
];
