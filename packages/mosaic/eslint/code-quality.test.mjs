import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

import { noAccumulatorCopy, noChainedTypeAssertions } from './code-quality.mjs';

RuleTester.describe = describe;

RuleTester.it = test;

RuleTester.itOnly = test.only;

const js = new RuleTester();

const ts = new RuleTester({ languageOptions: { parser: tseslint.parser } });

js.run('no-accumulator-copy', noAccumulatorCopy, {
  valid: [
    'const result = values.reduce((acc, value) => { acc.push(value); return acc; }, []);',
    'const copy = [...acc];',
    'values.reduce((acc, value) => { consume(...acc); acc.push(value); return acc; }, []);',
    'const result = values.reduce((acc, value) => { const nested = other.map(acc => [...acc]); acc.push(value); return acc; }, []);',
    'const result = values.reduce((acc, value) => { const nested = other.map(() => [...value]); acc.push(value); return acc; }, []);',
    'const result = values.reduce((acc, value) => { async function later() { return [...acc]; } acc.push(value); return acc; }, []);',
    'function f(Object, Array) { return values.reduce((acc, value) => Object.assign({}, acc, value) || Array.from(acc), []); }',
  ],
  invalid: [
    { code: 'values.reduce((acc, value) => [...acc, value], [])', errors: 1 },
    { code: 'values.reduce(function(acc, value) { return Object.assign({}, acc, value); }, {})', errors: 1 },
    { code: 'values.reduce((acc, value) => Array.from(acc), [])', errors: 1 },
    { code: 'values.reduce((acc, value) => acc.concat(value), [])', errors: 1 },
    { code: 'values.reduce((acc, value) => acc.slice(), [])', errors: 1 },
  ],
});

ts.run('no-chained-type-assertions', noChainedTypeAssertions, {
  valid: ['const x = value as const;', 'const x = value as unknown;', 'const x = (value as const) satisfies Shape;'],
  invalid: [
    { code: 'const x = value as unknown as Foo;', errors: 1 },
    { code: 'const x = ({ x: 1 } as const) as Foo;', errors: 1 },
    { code: 'const x = value as unknown as Foo as Bar;', errors: 1 },
    { code: 'const x = <Foo><unknown>value;', errors: 1 },
  ],
});
