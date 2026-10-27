import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = test;
RuleTester.itOnly = test.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

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
