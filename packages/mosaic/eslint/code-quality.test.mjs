import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, test } from 'vitest';

import { noChainedTypeAssertions, noWidenThenAssert } from './code-quality.mjs';
RuleTester.describe = describe;

RuleTester.it = test;

RuleTester.itOnly = test.only;

const ts = new RuleTester({ languageOptions: { parser: tseslint.parser } });

ts.run('no-chained-type-assertions', noChainedTypeAssertions, {
  valid: ['const x = value as const;', 'const x = value as unknown;', 'const x = (value as const) satisfies Shape;'],
  invalid: [
    { code: 'const x = value as unknown as Foo;', errors: 1 },
    { code: 'const x = ({ x: 1 } as const) as Foo;', errors: 1 },
    { code: 'const x = value as unknown as Foo as Bar;', errors: 1 },
    { code: 'const x = <Foo><unknown>value;', errors: 1 },
  ],
});

ts.run('no-widen-then-assert', noWidenThenAssert, {
  valid: [
    'const source: Foo = make(); const wide: unknown = source; const result = other as Foo;',
    'const source: Foo = make(); let wide: unknown = source; const result = wide as Foo;',
    'const source: Foo = make(); const wide: unknown = source; const result = (() => { const wide = other; return wide as Foo; })();',
    'const source: Foo = make(); const wide: unknown = source; const result = wide as Bar;',
    'const source: Foo = make(); function f() { const wide: unknown = source; return wide as Foo; }',
  ],
  invalid: [
    { code: 'const source: Foo = make(); const wide: unknown = source; const result = wide as Foo;', errors: 1 },
    { code: 'const source: Foo = make(); const wide = source as unknown; const result = wide as Foo;', errors: 1 },
    { code: 'function f(source: Foo) { const wide = <unknown>source; return <Foo>wide; }', errors: 1 },
    {
      code: 'function f(source: Foo) { const wide: Record<string, unknown> = source; return wide as Foo; }',
      errors: 1,
    },
    {
      code: 'const source: Foo = make(); const wide: object = source; const alias = wide; const result = alias as Foo;',
      errors: 1,
    },
  ],
});
