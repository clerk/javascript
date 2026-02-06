export const fixtures = [
  {
    name: 'Renames api.server import',
    source: `
import { getAuth, clerkMiddleware, rootAuthLoader } from '@clerk/react-router/api.server';
    `,
    output: `
import { getAuth, clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";
`,
  },
  {
    name: 'Renames single named import',
    source: `
import { getAuth } from '@clerk/react-router/api.server';
    `,
    output: `
import { getAuth } from "@clerk/react-router/server";
`,
  },
  {
    name: 'Renames require call',
    source: `
const { getAuth } = require('@clerk/react-router/api.server');
    `,
    output: `
const { getAuth } = require("@clerk/react-router/server");
`,
  },
  {
    name: 'Renames dynamic import',
    source: `
const mod = await import('@clerk/react-router/api.server');
    `,
    output: `
const mod = await import("@clerk/react-router/server");
`,
  },
  {
    name: 'Renames export source',
    source: `
export * from '@clerk/react-router/api.server';
    `,
    output: `
export * from "@clerk/react-router/server";
`,
  },
];
