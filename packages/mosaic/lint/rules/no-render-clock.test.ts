import { RuleTester } from 'oxlint/plugins-dev';

import { noRenderClock } from './no-render-clock.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('no-render-clock', noRenderClock, {
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
