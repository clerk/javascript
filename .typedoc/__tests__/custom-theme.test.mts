import { ReflectionKind, type Type } from 'typedoc';
import { describe, expect, it } from 'vitest';

import { getParameterObjectShapeDeclaration, getPickPropertyNames } from '../custom-theme.mjs';

const literal = (value: unknown) => ({ type: 'literal', value }) as unknown as Type;
const union = (...types: unknown[]) => ({ type: 'union', types }) as unknown as Type;

describe('getPickPropertyNames', () => {
  it('returns the single key for a string literal', () => {
    expect(getPickPropertyNames(literal('enrollmentMode'))).toEqual(['enrollmentMode']);
  });

  it('flattens a union of string literals', () => {
    expect(getPickPropertyNames(union(literal('a'), literal('b')))).toEqual(['a', 'b']);
  });

  it('recurses into nested unions', () => {
    expect(getPickPropertyNames(union(literal('a'), union(literal('b'), literal('c'))))).toEqual(['a', 'b', 'c']);
  });

  it('bails on a non-string literal key', () => {
    expect(getPickPropertyNames(literal(0))).toBeUndefined();
  });

  it('bails when any union arm is not a string literal', () => {
    expect(getPickPropertyNames(union(literal('a'), { type: 'reference', name: 'Foo' }))).toBeUndefined();
  });
});

describe('getParameterObjectShapeDeclaration', () => {
  const sourceInterface = (...names: string[]) => ({
    reflection: {
      kind: ReflectionKind.Interface,
      name: 'Src',
      children: names.map(name => ({ name })),
    },
  });

  const pick = (source: unknown, keys: unknown) =>
    ({
      type: 'reference',
      name: 'Pick',
      package: 'typescript',
      typeArguments: [{ type: 'reference', ...(source as object) }, keys],
    }) as unknown as Type;

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

  it('selects only the picked properties from a multi-key Pick', () => {
    const decl = getParameterObjectShapeDeclaration(
      pick(sourceInterface('name', 'enrollmentMode', 'other'), union(literal('name'), literal('enrollmentMode'))),
    );
    expect(decl?.children?.map(child => child.name)).toEqual(['name', 'enrollmentMode']);
  });

  it('does not mutate the source declaration', () => {
    const source = sourceInterface('name', 'enrollmentMode');
    getParameterObjectShapeDeclaration(pick(source, literal('enrollmentMode')));
    expect(source.reflection.children.map(child => child.name)).toEqual(['name', 'enrollmentMode']);
  });

  it('fails closed when a picked key is not a property of the source', () => {
    expect(getParameterObjectShapeDeclaration(pick(sourceInterface('name'), literal('missing')))).toBeUndefined();
  });

  it('fails closed for non-literal keys', () => {
    expect(
      getParameterObjectShapeDeclaration(
        pick(sourceInterface('name', 'enrollmentMode'), { type: 'reference', name: 'keyof Src' }),
      ),
    ).toBeUndefined();
  });

  it('does not treat Omit as a flattenable builtin', () => {
    const omit = {
      type: 'reference',
      name: 'Omit',
      package: 'typescript',
      reflection: undefined,
      typeArguments: [
        { type: 'reference', ...sourceInterface('name', 'enrollmentMode') },
        { type: 'literal', value: 'name' },
      ],
    } as unknown as Type;
    expect(getParameterObjectShapeDeclaration(omit)).toBeUndefined();
  });
});
