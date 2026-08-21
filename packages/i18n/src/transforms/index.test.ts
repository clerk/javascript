import { describe, expect, it } from 'vitest';

import { transform } from './index';

describe('transform', () => {
  it('produces a transform marker capturing the template and fn', () => {
    const t = transform((_locale, tpl) => () => tpl);
    expect(t('hi')).toMatchObject({ _type: 'transform', template: 'hi' });
    expect(typeof t('hi').fn).toBe('function');
  });
});
