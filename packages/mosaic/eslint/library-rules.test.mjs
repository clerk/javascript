import e18e from '@e18e/eslint-plugin';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = test;
RuleTester.itOnly = test.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

tester.run('e18e/no-spread-in-reduce', e18e.rules['no-spread-in-reduce'], {
  valid: [
    'values.reduce((acc, value) => { acc.push(value); return acc; }, []);',
    'const copy = [...acc];',
    'values.reduce((acc, value) => { const nested = other.map(acc => [...acc]); return acc; }, []);',
  ],
  invalid: [
    { code: 'values.reduce((acc, value) => [...acc, value], []);', errors: 1 },
    { code: 'values.reduce((acc, value) => ({...acc, [value.id]: value}), {});', errors: 1 },
  ],
});
