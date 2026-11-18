import { RuleTester } from 'oxlint/plugins-dev';

import { forwardRefParts } from './forward-ref-parts.ts';

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: 'tsx' } } });

ruleTester.run('forward-ref-parts', forwardRefParts, {
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
