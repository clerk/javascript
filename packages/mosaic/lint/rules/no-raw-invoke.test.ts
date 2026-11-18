import { RuleTester } from 'oxlint/plugins-dev';

import { noRawInvoke } from './no-raw-invoke.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('no-raw-invoke', noRawInvoke, {
  valid: [
    `
      declare const fromPromise: (run: () => Promise<number>) => object;
      export const state = { invoke: fromPromise(() => Promise.resolve(1)) };
    `,
  ],
  invalid: [
    {
      code: 'export const state = { invoke: { src: () => Promise.resolve(1), onDone: { target: "idle" } } };',
      errors: [{ messageId: 'useFromPromise' }],
    },
    {
      code: 'export const state = { invoke: { "src": () => Promise.resolve(1) } };',
      errors: [{ messageId: 'useFromPromise' }],
    },
    {
      code: 'export const state = { "invoke": { src: () => Promise.resolve(1) } };',
      errors: [{ messageId: 'useFromPromise' }],
    },
    {
      code: 'export const state = { invoke: { src: () => Promise.resolve(1) } as object };',
      errors: [{ messageId: 'useFromPromise' }],
    },
    {
      code: 'export const state = { invoke: { src: () => Promise.resolve(1) } satisfies object };',
      errors: [{ messageId: 'useFromPromise' }],
    },
  ],
});
