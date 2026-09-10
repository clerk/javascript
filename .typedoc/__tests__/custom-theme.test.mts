import { ReflectionKind, type Type } from 'typedoc';
import { describe, expect, it } from 'vitest';

import { getParameterObjectShapeDeclaration } from '../custom-theme.mjs';

describe('getParameterObjectShapeDeclaration', () => {
  it('does not resolve Pick sources whose declaration kind is unsupported', () => {
    const sourceType = {
      type: 'reference',
      name: 'ExampleClass',
      reflection: {
        kind: ReflectionKind.Class,
        children: [
          {
            name: 'someMethodName',
            kind: ReflectionKind.Method,
            signatures: [{}],
          },
        ],
      },
    } as unknown as Type;
    const pickType = {
      type: 'reference',
      name: 'Pick',
      package: 'typescript',
      typeArguments: [sourceType, { type: 'literal', value: 'someMethodName' }],
    } as unknown as Type;

    expect(getParameterObjectShapeDeclaration(pickType)).toBeUndefined();
  });
});
