import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

import { explicitTransitionProperties, preserveFocusOutline, reducedMotion } from './good-css.mjs';

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

tester.run('reduced-motion', reducedMotion, {
  valid: [
    `${stylex}sx.create({ a: { transitionProperty: { default: 'transform, width', '@media (prefers-reduced-motion: reduce)': 'opacity' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: { ':hover': 'transform', '@media (prefers-reduced-motion: reduce)': { ':hover': 'none' } } } });`,
    `${stylex}sx.create({ a: { transitionProperty: 'transform', transitionDuration: { default: '200ms', '@media (prefers-reduced-motion: reduce)': '0ms' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: { default: 'none', '@media (prefers-reduced-motion: no-preference)': 'transform' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: { default: 'none', '@media (prefers-reduced-motion: no-preference) and (min-width: 800px)': 'transform' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: 'opacity, color' } });`,
    `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': 'none' } } });`,
    `${stylex}const reduceMotion = '@media (prefers-reduced-motion: reduce)'; sx.create({ a: { transitionProperty: { default: 'transform', [reduceMotion]: 'none' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: { '@media (min-width: 800px)': 'transform', '@media (prefers-reduced-motion: reduce)': 'none' } } });`,
    `${stylex}sx.create({ a: { transition: { default: 'transform 200ms', '@media (prefers-reduced-motion: reduce)': 'none' } } });`,
    `${stylex}sx.create({ a: { transition: { default: 'transform 200ms', '@media (prefers-reduced-motion: reduce)': 'transform 0ms' } } });`,
    `${stylex}sx.create({ a: { transition: 'transform 200ms', transitionDuration: { default: '200ms', '@media (prefers-reduced-motion: reduce)': '0ms' } } });`,
    `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': 'none' }, transitionDuration: '200ms' } });`,
    'const obj = { transitionProperty: "transform" };',
  ],
  invalid: [
    { code: `${stylex}sx.create({ a: { transitionProperty: 'transform' } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { transition: { default: 'transform 200ms', '@media (prefers-reduced-motion: reduce)': 'transform 200ms 0ms' } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': dynamicOverride } } });`,
      errors: 1,
    },
    { code: `${stylex}sx.create({ a: value => { return { transition: 'transform 200ms' }; } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': { '@media (min-width: 800px)': 'none' } } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', [unknownCondition]: 'none' } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: no-preference) or (min-width: 800px)': 'transform' } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': 'transform' } } });`,
      errors: 1,
    },
    { code: `${stylex}sx.create({ a: { transition: 'transform 200ms' } });`, errors: 1 },
    { code: `${stylex}sx.create({ a: { transitionProperty: { ':hover': 'transform' } } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { ':hover': 'transform', '@media (prefers-reduced-motion: reduce)': { ':active': 'none' } } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media not (prefers-reduced-motion: no-preference)': 'none' } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce), (min-width: 10px)': 'none' } } });`,
      errors: 1,
    },
  ],
});

tester.run('preserve-focus-outline', preserveFocusOutline, {
  valid: [
    `${stylex}sx.create({ a: { outline: 'none' } });`,
    `${stylex}sx.create({ a: { outline: { ':focus-within': 'none', ':not(:focus)': 'none' } } });`,
    `${stylex}sx.create({ a: { outline: { default: 'none', ':focus-visible': '2px solid blue' } } });`,
    `${stylex}sx.create({ a: { outline: { default: 'none', ':focus-visible': 'none', '@media (forced-colors: active)': '2px solid CanvasText' } } });`,
    `${stylex}sx.create({ a: { ':focus-visible': { outline: 'none', outlineWidth: 2, outlineStyle: 'solid' } } });`,
    `${stylex}sx.create({ a: { outline: { ':focus-visible': '2px solid transparent' } } });`,
    `${stylex}sx.create({ a: { outline: { ':focus-visible': { default: 'none', '@media (forced-colors: active)': '2px solid CanvasText' } } } });`,
    'const obj = { outline: { ":focus-visible": "none" } };',
  ],
  invalid: [
    {
      code: `${stylex}sx.create({ a: { outline: { default: '2px solid blue', ':focus-visible': 'none' } } });`,
      errors: 1,
    },
    { code: `${stylex}sx.create({ a: { ':focus-visible': { outline: 0, boxShadow: '0 0 2px blue' } } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { outline: { ':focus-visible': { default: 'none', '@media (forced-colors: active)': 'none' } } } });`,
      errors: 1,
    },
    { code: `${stylex}sx.create({ a: { outline: { ':focus-visible': '0 solid transparent' } } });`, errors: 1 },
    {
      code: `${stylex}sx.create({ a: { outline: { ':focus-visible': { default: 'none', '@media (forced-colors: active) and (min-width: 800px)': '2px solid CanvasText' } } } });`,
      errors: 1,
    },
    {
      code: `${stylex}sx.create({ a: { ':focus-visible': { outline: 'none', outlineWidth: 0, outlineStyle: 'solid' } } });`,
      errors: 1,
    },
  ],
});
