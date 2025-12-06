export const fixtures = [
  {
    name: 'Renames root import',
    source: `
import { dark, light } from '@clerk/themes';
    `,
    output: `
import { dark, light } from "@clerk/ui/themes";
`,
  },
  {
    name: 'Renames subpath import',
    source: `
import palette from '@clerk/themes/palette';
    `,
    output: `
import palette from "@clerk/ui/themes/palette";
`,
  },
  {
    name: 'Renames require call',
    source: `
const themes = require('@clerk/themes');
    `,
    output: `
const themes = require("@clerk/ui/themes");
`,
  },
  {
    name: 'Renames dynamic import',
    source: `
const mod = await import('@clerk/themes/foo');
    `,
    output: `
const mod = await import("@clerk/ui/themes/foo");
`,
  },
  {
    name: 'Renames export source',
    source: `
export * from '@clerk/themes';
    `,
    output: `
export * from "@clerk/ui/themes";
`,
  },
];
