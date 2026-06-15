import { describe, expect, it } from 'vitest';

import { count } from './index';

describe('count', () => {
  it('creates a count marker carrying the plural forms', () => {
    const forms = { one: '{count} item', other: '{count} items' };
    expect(count(forms)).toEqual({ _type: 'count', forms });
  });
});
