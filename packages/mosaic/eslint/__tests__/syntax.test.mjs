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
        errors: [/^Use `Form` from src\/primitives\/form, driven by `useForm` from src\/components\/form/],
      },
      {
        name: "keeps JSX restrictions: export const Sample = ({ Part }: { Part: 'div' }) => <Part className='x' />;",
        filename: 'src/components/sample.tsx',
        code: "export const Sample = ({ Part }: { Part: 'div' }) => <Part className='x' />;",
        errors: [
          /^Mosaic parts take `xstyle` instead of `className`\/`style`\. Define the atoms with `stylex\.create` in the sibling `\*\.styles\.ts` file/,
        ],
      },
      {
        name: 'rejects native forms in views',
        filename: 'src/features/reverification/sample.view.tsx',
        code: 'export function View() { return <form />; }',
        errors: [/^Use `Form` from src\/primitives\/form, driven by `useForm` from src\/components\/form/],
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
        errors: [
          /^Mosaic parts take `xstyle` instead of `className`\/`style`\. Define the atoms with `stylex\.create` in the sibling `\*\.styles\.ts` file/,
        ],
      })),
      ...['Part', 'Card.Root'].map(component => ({
        name: `rejects stylex.props spreads on ${component}`,
        filename: 'src/components/sample.tsx',
        code: `export const Sample = () => <${component} {...stylex.props(styles.root)} />;`,
        errors: [
          /^Mosaic parts take the atoms as `xstyle`, not a `stylex\.props\(\.\.\.\)` spread\. Define them with `stylex\.create` in the sibling `\*\.styles\.ts` file/,
        ],
      })),
    ].map(testCase => ({ ...testCase, options })),
  });
});

describe('raw element guards in features and blocks', () => {
  const override = config.overrides.find(
    override => override.files.includes('src/features/**/*') && override.rules['eslint-compat/no-restricted-syntax'],
  );
  const options = override.rules['eslint-compat/no-restricted-syntax'].slice(1);
  ruleTester.run('no-restricted-syntax', syntaxPlugin.rules['no-restricted-syntax'], {
    valid: [
      "export const View = () => <Menu.Item render={<button type='button' onClick={onPick} />} />;",
      'export const View = () => <Part render={<svg aria-hidden />} />;',
      "export const View = () => <input type='hidden' name='id' value={id} />;",
      "export const View = () => <input readOnly hidden name='identifier' value={identifier} />;",
      "export const View = () => <input type='password' hidden name='password' />;",
      'export const View = () => <Menu.Item render={props => <button {...props} />} />;',
      'export const View = () => <Part render={function render(props) { return <svg {...props} />; }} />;',
      'export const View = () => <Part render={(props, state) => { return <input {...props} />; }} />;',
      "export const View = () => <input hidden={true} name='identifier' />;",
      "export const View = () => <Button type='button' />;",
      "export const View = () => <Icon name='check' />;",
    ].flatMap(code =>
      ['src/features/sample/sample.view.tsx', 'src/blocks/sample/sample.tsx'].map(filename => ({
        code,
        filename,
        options,
      })),
    ),
    invalid: [
      {
        name: 'rejects a raw button',
        code: "export const View = () => <button type='button' />;",
        errors: [/^Use `Button` from src\/components\/button, or `SubmitButton` when the click runs an async action/],
      },
      {
        name: 'rejects a raw button nested in a render prop element',
        code: "export const View = () => <Part render={<div><button type='button' /></div>} />;",
        errors: [/^Use `Button` from src\/components\/button/],
      },
      {
        name: 'rejects a raw button nested in a render callback element',
        code: 'export const View = () => <Part render={props => <div {...props}><button type="button" /></div>} />;',
        errors: [/^Use `Button` from src\/components\/button/],
      },
      {
        name: 'rejects a visible input with hidden={false}',
        code: "export const View = () => <input hidden={false} name='field' />;",
        errors: [/^Use `Input` from src\/components\/input inside `Field`/],
      },
      {
        name: 'rejects a visible password input with hidden={false}',
        code: "export const View = () => <input type='password' hidden={false} name='field' />;",
        errors: [/^Use `PasswordInput` from src\/components\/password-input/],
      },
      {
        name: 'rejects a raw svg',
        code: 'export const View = () => <svg viewBox="0 0 16 16"><path d="M0 0" /></svg>;',
        errors: [/^Use an icon from src\/icons through `Icon`.*stop and ask the user/],
      },
      ...[
        ["type='password'", /^Use `PasswordInput` from src\/components\/password-input inside `Field`/],
        ["type='tel'", /^Use `PhoneInput` from src\/components\/phone-input inside `Field`/],
        ["type='checkbox'", /^Use `Checkbox` from src\/components\/checkbox, or `Switch`/],
        ["type='radio'", /^Use `Radio` from src\/components\/radio/],
        ["type='file'", /^Use `FileUpload` from src\/primitives\/file-upload, or `AvatarUpload`/],
        ["type='email'", /^Use `Input` from src\/components\/input inside `Field`/],
        ["type='text'", /^Use `Input` from src\/components\/input inside `Field`/],
        ['', /^Use `Input` from src\/components\/input inside `Field`/],
      ].map(([type, message]) => ({
        name: `rejects a visible input: <input ${type} />`,
        code: `export const View = () => <input ${type} name='field' />;`,
        errors: [message],
      })),
      {
        name: 'keeps the shared JSX guards',
        code: 'export const View = () => <form />;',
        errors: [/^Use `Form` from src\/primitives\/form, driven by `useForm` from src\/components\/form/],
      },
    ].flatMap(testCase =>
      ['src/features/sample/sample.view.tsx', 'src/blocks/sample/sample.tsx'].map(filename => ({
        ...testCase,
        name: `${testCase.name} in ${filename}`,
        filename,
        options,
      })),
    ),
  });
});
