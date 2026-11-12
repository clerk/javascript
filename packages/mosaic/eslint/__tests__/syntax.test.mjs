import { createRequire } from 'node:module';
import path from 'node:path';

import { RuleTester } from 'oxlint/plugins-dev';
import { describe, test } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = test;

const require = createRequire(import.meta.url);
const config = require('../../oxlint.config.mjs').default;
const ruleTester = new RuleTester({ cwd: path.resolve(import.meta.dirname, '../..') });

const syntaxPlugin = require(config.jsPlugins.find(plugin => plugin.name === 'eslint-compat').specifier).default;

describe('style guards', () => {
  const options = config.overrides
    .find(
      override => override.files.includes('src/**/*.styles.ts') && override.rules['eslint-compat/no-restricted-syntax'],
    )
    .rules['eslint-compat/no-restricted-syntax'].slice(1);
  ruleTester.run('no-restricted-syntax', syntaxPlugin.rules['no-restricted-syntax'], {
    valid: [
      {
        name: 'allows hover and motion guards',
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            base: {
              color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:not(:disabled)': 'blue' } },
              opacity: { default: 1, '@media (prefers-reduced-motion: no-preference)': 0.5 },
            },
          });
        `,
      },
      {
        name: 'allows hover that skips disabled controls: \':hover:not(:disabled, [data-disabled], [aria-disabled="true"])\'',
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': 'blue' } } } });
        `,
      },
      {
        name: "allows hover that skips disabled controls: ':hover:not(:disabled):checked'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:not(:disabled):checked': 'blue' } } } });
        `,
      },
      {
        name: "allows hover that skips disabled controls: ':not([data-disabled]):hover'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':not([data-disabled]):hover': 'blue' } } } });
        `,
      },
      {
        name: "allows hover that skips disabled controls: ':hover:not(:active):not(:disabled)'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:not(:active):not(:disabled)': 'blue' } } } });
        `,
      },
      {
        name: "allows reduced motion: transitionProperty: 'opacity, background-color'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: 'opacity, background-color' } });
        `,
      },
      {
        name: "allows reduced motion: transitionProperty: '--_cl-scale-color'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: '--_cl-scale-color' } });
        `,
      },
      {
        name: "allows reduced motion: transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'opacity' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'opacity' } } });
        `,
      },
      {
        name: "allows reduced motion: transitionProperty: { default: 'opacity', '@media (prefers-reduced-motion: no-preference)': 'opacity, transform' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: { default: 'opacity', '@media (prefers-reduced-motion: no-preference)': 'opacity, transform' } } });
        `,
      },
      {
        name: "allows reduced motion: transform: 'scale(0.5)'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transform: 'scale(0.5)' } });
        `,
      },
      {
        name: "allows reduced motion: transform: { default: 'scale(1)', ':where([data-starting-style])': 'scale(0.94)', '@media (prefers-reduced-motion: reduce)': { default: 'scale(1)', ':where([data-starting-style])': 'scale(1)' } }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transform: { default: 'scale(1)', ':where([data-starting-style])': 'scale(0.94)', '@media (prefers-reduced-motion: reduce)': { default: 'scale(1)', ':where([data-starting-style])': 'scale(1)' } } } });
        `,
      },
      {
        name: "allows reduced motion: translate: { default: null, '@media (prefers-reduced-motion: no-preference)': { default: null, ':where([data-ending-style])': '0 100%' } }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { translate: { default: null, '@media (prefers-reduced-motion: no-preference)': { default: null, ':where([data-ending-style])': '0 100%' } } } });
        `,
      },
    ].map(testCase => ({ ...testCase, options })),
    invalid: [
      {
        name: "rejects hover outside its media guard: { default: 'red', ':hover:not(:disabled)': 'blue' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', ':hover:not(:disabled)': 'blue' } } });
        `,
        errors: [/'@media \(hover: hover\)'/],
      },
      {
        name: "rejects hover outside its media guard: { default: 'red', ':not([data-disabled]):hover': 'blue' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', ':not([data-disabled]):hover': 'blue' } } });
        `,
        errors: [/'@media \(hover: hover\)'/],
      },
      {
        name: "rejects hover outside its media guard: { default: 'red', ':is(:hover:not(:disabled), :focus-within)': 'blue' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', ':is(:hover:not(:disabled), :focus-within)': 'blue' } } });
        `,
        errors: [/'@media \(hover: hover\)'/],
      },
      {
        name: "rejects hover outside its media guard: { default: 'red', '@media (pointer: fine)': { default: null, ':hover:not(:disabled)': 'blue' } }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (pointer: fine)': { default: null, ':hover:not(:disabled)': 'blue' } } } });
        `,
        errors: [/'@media \(hover: hover\)'/],
      },
      {
        name: "rejects hover that paints disabled controls: ':hover'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover': 'blue' } } } });
        `,
        errors: [/disabled/],
      },
      {
        name: "rejects hover that paints disabled controls: ':hover:not([data-invalid])'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:not([data-invalid])': 'blue' } } } });
        `,
        errors: [/disabled/],
      },
      {
        name: "rejects hover that paints disabled controls: ':enabled:hover'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':enabled:hover': 'blue' } } } });
        `,
        errors: [/disabled/],
      },
      {
        name: "rejects hover that paints disabled controls: ':hover:disabled'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { color: { default: 'red', '@media (hover: hover)': { default: null, ':hover:disabled': 'blue' } } } });
        `,
        errors: [/disabled/],
      },
      {
        name: "rejects a transition without reduced motion: transitionProperty: 'opacity, transform'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: 'opacity, transform' } });
        `,
        errors: [/drop the moving property under '@media \(prefers-reduced-motion: reduce\)'/],
      },
      {
        name: "rejects a transition without reduced motion: transitionProperty: 'all'",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: 'all' } });
        `,
        errors: [/drop the moving property under '@media \(prefers-reduced-motion: reduce\)'/],
      },
      {
        name: "rejects a transition without reduced motion: transitionProperty: { default: 'translate', ':where([data-open])': 'opacity' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: { default: 'translate', ':where([data-open])': 'opacity' } } });
        `,
        errors: [/drop the moving property under '@media \(prefers-reduced-motion: reduce\)'/],
      },
      {
        name: "rejects a transition without reduced motion: transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'opacity, transform' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: { default: 'opacity, transform', '@media (prefers-reduced-motion: reduce)': 'opacity, transform' } } });
        `,
        errors: [/drop the moving property under '@media \(prefers-reduced-motion: reduce\)'/],
      },
      {
        name: "rejects a transition without reduced motion: transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: no-preference)': 'transform' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: no-preference)': 'transform' } } });
        `,
        errors: [/drop the moving property under '@media \(prefers-reduced-motion: reduce\)'/],
      },
      {
        name: "rejects an offset without reduced motion: transform: { default: 'scale(1)', ':where([data-starting-style], [data-ending-style])': 'scale(0.94)' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transform: { default: 'scale(1)', ':where([data-starting-style], [data-ending-style])': 'scale(0.94)' } } });
        `,
        errors: [/restate the enter and exit values/],
      },
      {
        name: "rejects an offset without reduced motion: translate: { default: '0 0', ':where([data-ending-style])': '0 100%' }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { translate: { default: '0 0', ':where([data-ending-style])': '0 100%' } } });
        `,
        errors: [/restate the enter and exit values/],
      },
      {
        name: "rejects an offset without reduced motion: transform: { default: 'scale(1)', ':where([data-starting-style])': 'scale(0.94)', '@media (prefers-reduced-motion: no-preference)': { default: null } }",
        filename: 'src/components/sample.styles.ts',
        code: `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({ base: { transform: { default: 'scale(1)', ':where([data-starting-style])': 'scale(0.94)', '@media (prefers-reduced-motion: no-preference)': { default: null } } } });
        `,
        errors: [/restate the enter and exit values/],
      },
    ].map(testCase => ({ ...testCase, options })),
  });
});

describe('JSX guards', () => {
  const options = config.overrides
    .find(override => override.files.includes('src/**/*') && override.rules['eslint-compat/no-restricted-syntax'])
    .rules['eslint-compat/no-restricted-syntax'].slice(1);
  ruleTester.run('no-restricted-syntax', syntaxPlugin.rules['no-restricted-syntax'], {
    valid: [
      'export const Sample = ({ visible }) => <div>{visible ? <Part /> : null}</div>;',
      'export const Sample = () => <div className="x" style={{ color: "red" }} />;',
      'export const Sample = () => <div {...stylex.props(styles.root)} />;',
      'export const Sample = () => <Form><Part xstyle={styles.root} /><Card.Root xstyle={styles.root} /></Form>;',
    ].map(code => ({ code, filename: 'src/components/sample.tsx', options })),
    invalid: [
      {
        name: 'keeps JSX restrictions: export const Sample = () => <form />;',
        filename: 'src/components/sample.tsx',
        code: 'export const Sample = () => <form />;',
        errors: [/Use `Form` from mosaic\/primitives\/form/],
      },
      {
        name: "keeps JSX restrictions: export const Sample = ({ Part }: { Part: 'div' }) => <Part className='x' />;",
        filename: 'src/components/sample.tsx',
        code: "export const Sample = ({ Part }: { Part: 'div' }) => <Part className='x' />;",
        errors: [/Mosaic parts take `xstyle`/],
      },
      {
        name: 'rejects native forms in views',
        filename: 'src/features/reverification/sample.view.tsx',
        code: 'export function View() { return <form />; }',
        errors: [/Use `Form` from mosaic\/primitives\/form/],
      },
      {
        name: 'rejects logical AND in conditional JSX',
        filename: 'src/components/sample.tsx',
        code: 'export const Sample = ({ count }) => <div>{count && <Part />}</div>;',
        errors: [/Use a ternary/],
      },
      ...['className="x"', 'style={{ color: "red" }}'].map(attribute => ({
        name: `rejects ${attribute} on member components`,
        filename: 'src/components/sample.tsx',
        code: `export const Sample = () => <Card.Root ${attribute} />;`,
        errors: [/Mosaic parts take `xstyle`/],
      })),
      ...['Part', 'Card.Root'].map(component => ({
        name: `rejects stylex.props spreads on ${component}`,
        filename: 'src/components/sample.tsx',
        code: `export const Sample = () => <${component} {...stylex.props(styles.root)} />;`,
        errors: [/Mosaic parts take the atoms as `xstyle`/],
      })),
    ].map(testCase => ({ ...testCase, options })),
  });
});
