import { RuleTester } from 'oxlint/plugins-dev';
import { describe, test } from 'vitest';

import plugin from '../plugin.mjs';

RuleTester.describe = describe;
RuleTester.it = test;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('no-model-react-state', plugin.rules['no-model-react-state'], {
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

ruleTester.run('no-dynamic-message-catalogs', plugin.rules['no-dynamic-message-catalogs'], {
  valid: [
    "import('./reverification.controller');",
    'import(`./reverification.model`);',
    "export type Messages = typeof import('./reverification.messages');",
    "import React from 'react'; React.useState(0);",
  ],
  invalid: [
    { code: "import('./reverification.messages');", errors: [{ messageId: 'useMessages' }] },
    { code: 'import(`./reverification.messages.ts`);', errors: [{ messageId: 'useMessages' }] },
  ],
});

ruleTester.run('forward-ref-parts', plugin.rules['forward-ref-parts'], {
  valid: [
    `
      import React from 'react';
      import { useRender } from './utils';
      export const Part = React.forwardRef<HTMLButtonElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'button', ref: [null, ref], props }); });
    `,
    `
      import React from 'react';
      import { useRender } from './utils';
      export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref, props }); });
    `,
    `
      import React from 'react';
      import { useRender } from './utils';
      export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref: [null, ref ?? null], props }); });
    `,
    `
      import React from 'react';
      import { useRender } from './utils';
      export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props: { open?: boolean }, ref) { const finalRef = props.open ? ref : [null, ref]; return useRender({ defaultTagName: 'div', ref: finalRef, props }); });
    `,
    `
      import React from 'react';
      import { useRender } from './utils';
      export function Provider(props: { children: React.ReactNode }) { return props.children; }
    `,
  ],
  invalid: [
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export function Part(props: { render?: never }) { return useRender({ defaultTagName: 'div', props }); }
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export const Part = (props: { render?: never }) => useRender({ defaultTagName: 'div', props });
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export function Part(props: { render?: never }) { return <Composite render={() => useRender({ defaultTagName: 'div', props })} />; }
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props) { return useRender({ defaultTagName: 'div', props }); });
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { const internalRef = React.useRef(null); return useRender({ defaultTagName: 'div', ref: internalRef, props }); });
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { const internalRef = React.useRef(null); return useRender({ defaultTagName: 'div', ref: [internalRef], props }); });
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
    {
      code: `
        import React from 'react';
        import { useRender } from './utils';
        export const Part = React.forwardRef<HTMLDivElement, object>(function Part(props, ref) { return useRender({ defaultTagName: 'div', ref: null, props }); });
      `,
      errors: [{ messageId: 'forwardRef' }],
    },
  ],
});

ruleTester.run('no-raw-invoke', plugin.rules['no-raw-invoke'], {
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

ruleTester.run('no-render-clock', plugin.rules['no-render-clock'], {
  valid: [
    `
      import { useEffect } from 'react';
      export function useSample() { useEffect(() => { void Date.now(); }, []); }
    `,
    `
      import { useEffect } from 'react';
      export function Sample() { useEffect(function RecordTime() { void Date.now(); }, []); return null; }
    `,
    `
      import { useCallback } from 'react';
      export function useSample() { return useCallback(() => Date.now(), []); }
    `,
    'export function useSample() { return { onClick: () => new Date() }; }',
    'export function useSample() { return usePendingAction(() => Date.now()); }',
    'export function useSample() { return () => setTimeout(() => Date.now(), 0); }',
    'export function useSample(load: Promise<void>) { void load.then(() => Date.now()); }',
    'export function unlockTime(seconds: number) { return Date.now() + seconds * 1000; }',
    'export function useSample(value: string) { return new Date(value); }',
  ],
  invalid: [
    { code: 'export function useSample() { return Date.now(); }', errors: [{ messageId: 'useNow' }] },
    {
      code: 'export function Sample() { const now = new Date(); return now.getTime(); }',
      errors: [{ messageId: 'useNow' }],
    },
    { code: 'export const useSample = () => Date.now();', errors: [{ messageId: 'useNow' }] },
    {
      code: `
        import { useState } from 'react';
        export function useSample() { return useState(() => Date.now())[0]; }
      `,
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: `
        import { useState } from 'react';
        export function useSample() { return useState(Date.now)[0]; }
      `,
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: `
        import { useMemo } from 'react';
        export function useSample() { return useMemo(() => new Date(), []); }
      `,
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: `
        import { useRef } from 'react';
        export function useSample() { return useRef(Date.now()); }
      `,
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: 'export function useSample(items: number[]) { return items.map(item => item - Date.now()); }',
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: 'export function useSample() { return Array.from([1], () => new Date()); }',
      errors: [{ messageId: 'useNow' }],
    },
    {
      code: `
        import { forwardRef } from 'react';
        export const Sample = forwardRef(() => { void Date.now(); return null; });
      `,
      errors: [{ messageId: 'useNow' }],
    },
  ],
});
