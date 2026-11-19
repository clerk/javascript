import { RuleTester } from 'oxlint/plugins-dev';

import plugin from '../plugin.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('model-callbacks-return-clerk-call', plugin.rules['model-callbacks-return-clerk-call'], {
  valid: [
    'export type Model = { status: "ready"; onSave: () => ClerkCall };',
    'export interface Model { onSave(): ClerkCall<string> }',
    'export type Model = { save: (run: (user: User) => Promise<unknown>) => ClerkCall };',
    'export interface Model { save(run: () => Promise<void>): ClerkCall }',
    'function helper(calls: { load: () => Promise<void> }) { return calls; }',
    'async function load(): Promise<void> {}',
    'const load = async (): Promise<string> => "";',
  ],
  invalid: [
    { code: 'export type Model = { onSave: () => Promise<void> };', errors: [{ messageId: 'returnClerkCall' }] },
    {
      code: 'export interface RequestsViewProps { onAccept?: (id: string) => void | Promise<void> }',
      errors: [{ messageId: 'returnClerkCall' }],
    },
    { code: 'export interface Model { onSave(): Promise<void> }', errors: [{ messageId: 'returnClerkCall' }] },
    {
      code: 'export type Model = { status: "loading" } | { status: "ready"; actions: { run: (id: string) => Promise<unknown> } };',
      errors: [{ messageId: 'returnClerkCall' }],
    },
    { code: 'type Local = { onSave: () => Promise<void> };', errors: [{ messageId: 'returnClerkCall' }] },
    { code: 'export interface Model { onSave: () => Promise<void> }', errors: [{ messageId: 'returnClerkCall' }] },
    { code: 'export type Model = { onSave: () => Promise<void> | void };', errors: [{ messageId: 'returnClerkCall' }] },
    { code: 'export type Model = { onSave: () => void | ClerkCall };', errors: [{ messageId: 'returnClerkCall' }] },
  ],
});
