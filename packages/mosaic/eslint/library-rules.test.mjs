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

tester.run('consistent-type-assertions', tseslint.plugin.rules['consistent-type-assertions'], {
  valid: [
    { code: 'const value = { name: "example" } as const;', options: [{ assertionStyle: 'never' }] },
    { code: 'const value = { name: "example" } satisfies Example;', options: [{ assertionStyle: 'never' }] },
  ],
  invalid: [
    { code: 'const result = value as unknown as Result;', options: [{ assertionStyle: 'never' }], errors: 2 },
    {
      code: 'const source: string = "example"; const wide: unknown = source; const result = wide as string;',
      options: [{ assertionStyle: 'never' }],
      errors: 1,
    },
  ],
});
