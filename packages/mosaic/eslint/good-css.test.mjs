import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

import { explicitTransitionProperties } from './good-css.mjs';

RuleTester.describe = describe;

RuleTester.it = test;

RuleTester.itOnly = test.only;

const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser, ecmaVersion: 'latest', sourceType: 'module' },
});

const stylex = "import * as sx from '@stylexjs/stylex'; ";

const named = "import { create as make } from '@stylexjs/stylex'; ";

tester.run('explicit-transition-properties', explicitTransitionProperties, {
  valid: [
    `${stylex}sx.create({ a: { transition: '200ms opacity' } });`,
    `${named}make({ a: { transition: 'transform 150ms ease, opacity 200ms' } });`,
    `${stylex}sx.create({ a: { transitionDuration: '200ms', transitionProperty: 'opacity' } });`,
    `${stylex}sx.create({ a: { transitionDuration: '200ms' } });`,
    `${stylex}sx.create({ a: { transition: 'opacity 200ms allow-discrete' } });`,
    `${stylex}sx.create({ a: { transition: 'opacity 200ms -100ms' } });`,
    `${stylex}sx.create({ a: { transition: '200ms -100ms transform' } });`,
    `${stylex}sx.create({ a: { transition: 'none', transitionProperty: 'inherit' } });`,
    'const obj = { transition: "all 200ms" };',
    `${stylex}sx.create({ a: { transition: variable } });`,
    `${stylex}function f(sx) { return sx.create({ a: { transition: 'all 200ms' } }); }`,
    `${stylex}sx.create({ a: { transitionProperty: { default: 'opacity', ':hover': 'color' } } });`,
  ],
  invalid: [
    { code: `${stylex}sx.create({ a: { transition: 'all 200ms' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transition: '200ms ease' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transition: '200ms allow-discrete' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transition: '200ms -100ms' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: value => ({ transition: 'all 200ms' }) });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transitionProperty: 'all' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transitionProperty: { default: 'opacity', ':hover': 'all' } } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { transition: { default: 'opacity 200ms', '@media (prefers-reduced-motion: no-preference)': 'all 1s' } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transition: 'opacity 200ms cubic-bezier(0.2, 0, 0.5, 1), all 300ms' } });`,
      errors: 1,
    },
  ],
});
