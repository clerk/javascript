import { describe, expect, it } from 'vitest';

import { createDynamicParamParser } from '../dynamicParamParser';

const entity = {
  foo: 'foo_string',
  bar: 'bar_string',
};

describe('createDynamicParamParser', () => {
  const testCases = [
    [':foo', entity, 'foo_string'],
    ['/:foo', entity, '/foo_string'],
    ['/some/:bar/any', entity, '/some/bar_string/any'],
    ['/:notValid', entity, '/:notValid'],
  ] as const;

  it.each(testCases)(
    'replaces the dynamic param with the value assigned to the key inside the object. Url=(%s), Object=(%s), result=(%s)',
    (urlWithParam, obj, result) => {
      expect(
        createDynamicParamParser({ regex: /:(\w+)/ })({
          urlWithParam,
          entity: obj,
        }),
      ).toEqual(result);
    },
  );
});
