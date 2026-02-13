export const fixtures = [
  {
    name: 'Rewrites basic type import',
    source: `
import type { UserResource, ClerkResource } from '@clerk/types';
    `,
    output: `
import type { UserResource, ClerkResource } from "@clerk/shared/types";
`,
  },
  {
    name: 'Rewrites value import',
    source: `
import { OAUTH_PROVIDERS } from '@clerk/types';
    `,
    output: `
import { OAUTH_PROVIDERS } from "@clerk/shared/types";
`,
  },
  {
    name: 'Redirects Appearance to @clerk/ui',
    source: `
import type { Appearance } from '@clerk/types';
    `,
    output: `
import type { Appearance } from "@clerk/ui";
`,
  },
  {
    name: 'Splits mixed import with Appearance',
    source: `
import type { Appearance, UserResource, ClerkResource } from '@clerk/types';
    `,
    output: `
import type { UserResource, ClerkResource } from "@clerk/shared/types";
import type { Appearance } from "@clerk/ui";
`,
  },
  {
    name: 'Handles require statements',
    source: `
const { UserResource } = require('@clerk/types');
    `,
    output: `
const { UserResource } = require("@clerk/shared/types");
`,
  },
  {
    name: 'Handles require with Appearance only',
    source: `
const { Appearance } = require('@clerk/types');
    `,
    output: `
const { Appearance } = require("@clerk/ui");
`,
  },
  {
    name: 'Splits mixed require with Appearance',
    source: `
const { Appearance, UserResource } = require('@clerk/types');
    `,
    output: `
const {
  UserResource
} = require("@clerk/shared/types");

const {
  Appearance
} = require("@clerk/ui");
`,
  },
  {
    name: 'Handles namespace import',
    source: `
import * as Types from '@clerk/types';
    `,
    output: `
import * as Types from "@clerk/shared/types";
`,
  },
];
