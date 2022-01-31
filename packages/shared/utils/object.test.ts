import { camelToSnakeKeys } from './object';

describe('camelToSnakeKeys', () => {
  it('transforms camelCased keys to snake_cased', () => {
    expect(camelToSnakeKeys({ key: 1, anotherKey: 2 })).toStrictEqual({
      key: 1,
      another_key: 2,
    });

    expect(
      camelToSnakeKeys({
        key: 1,
        anotherKey: 2,
        nestAttribute: { nestedKey: 3 },
      }),
    ).toStrictEqual({
      key: 1,
      another_key: 2,
      nest_attribute: {
        nested_key: 3,
      },
    });
  });

  it('handles null and undefined values', () => {
    expect(camelToSnakeKeys({ key: 1, anotherKey: null })).toStrictEqual({
      key: 1,
      another_key: null,
    });

    expect(
      camelToSnakeKeys({
        key: 1,
        anotherKey: 2,
        nestAttribute: { nestedKey: null },
      }),
    ).toStrictEqual({
      key: 1,
      another_key: 2,
      nest_attribute: {
        nested_key: null,
      },
    });
  });

  it('transforms and removes camelCased keys', () => {
    const sampleObject = camelToSnakeKeys({ key: 1, anotherKey: 2 });
    expect(sampleObject).not.toHaveProperty('anotherKey');
    expect(sampleObject).toHaveProperty('another_key');
  });

  it('prioritizes the camelCased property', () => {
    const sampleObject = camelToSnakeKeys({ oneKey: 1, one_key: 2 });
    const anotherSampleObject = camelToSnakeKeys({ one_key: 2, oneKey: 1 });

    expect(sampleObject.one_key).toEqual(1);
    expect(sampleObject).not.toHaveProperty('oneKey');
    expect(anotherSampleObject.one_key).toEqual(1);
    expect(anotherSampleObject).not.toHaveProperty('oneKey');
  });
});
