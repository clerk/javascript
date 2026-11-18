import { describe, expect, it } from 'vitest';

import { httpsUrl } from '../auth.utils';

describe('httpsUrl', () => {
  it('keeps an https link and drops any other scheme or an unparsable value', () => {
    expect(httpsUrl('https://acme.com/support')).toBe('https://acme.com/support');
    expect(httpsUrl('javascript:alert(1)')).toBeUndefined();
    expect(httpsUrl('http://acme.com/support')).toBeUndefined();
    expect(httpsUrl('data:text/html,hi')).toBeUndefined();
    expect(httpsUrl('/support')).toBeUndefined();
    expect(httpsUrl(undefined)).toBeUndefined();
  });
});
