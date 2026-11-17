import { describe, expect, it } from 'vitest';

import { decodeSegment, encodeSegment, paramKey, readParam, splitParamValue, writeParam } from '../url-params';

const awkward = ['a/b', '100%', 'two words', 'a+b', 'a&b', 'a=b', 'a#b', 'a?b', 'åäö', '日本', '%2F'];

describe('encodeSegment and decodeSegment', () => {
  it.each(awkward)('round-trips %j as one part', value => {
    const parts = ['billing', value];
    expect(decodeSegment(encodeSegment(parts))).toEqual(parts);
  });

  it('splits on the encoded form, so an encoded slash stays inside its part', () => {
    expect(decodeSegment('billing/st%2F1')).toEqual(['billing', 'st/1']);
  });

  it('decodes each part exactly once', () => {
    expect(decodeSegment('a%2520b')).toEqual(['a%20b']);
  });

  it('reads the empty segment as no parts', () => {
    expect(decodeSegment('')).toEqual([]);
    expect(encodeSegment([])).toBe('');
  });

  it('reads a malformed escape as no parts', () => {
    expect(decodeSegment('billing/%E0%A4%A')).toEqual([]);
    expect(decodeSegment('%')).toEqual([]);
  });

  it('leaves a plus sign as it is', () => {
    expect(decodeSegment('a+b')).toEqual(['a+b']);
  });
});

describe('paramKey', () => {
  it('names the param after the base, with dots for slashes', () => {
    expect(paramKey('', '/user')).toBe('.user');
    expect(paramKey('', '/modal/user')).toBe('.modal.user');
    expect(paramKey('clerk', 'modal/user/')).toBe('clerk.modal.user');
    expect(paramKey('', '/')).toBe('');
  });
});

describe('splitParamValue', () => {
  it('splits a decoded value on the slash', () => {
    expect(splitParamValue('organization/general')).toEqual(['organization', 'general']);
    expect(splitParamValue('two words')).toEqual(['two words']);
    expect(splitParamValue('')).toEqual([]);
  });
});

describe('readParam', () => {
  it('reads the value of its pair decoded, as any param is read', () => {
    expect(readParam('a=1&.user=billing/st%201&b=2', '.user')).toBe('billing/st 1');
    expect(readParam('.user=organization%2Fgeneral', '.user')).toBe('organization/general');
    expect(readParam('.user=two+words', '.user')).toBe('two words');
  });

  it('reads nothing when the pair is missing', () => {
    expect(readParam('a=1&.users=x&x.user=y&user=z', '.user')).toBeUndefined();
    expect(readParam('', '.user')).toBeUndefined();
  });

  it('reads a pair without a value as empty', () => {
    expect(readParam('.user=&a=1', '.user')).toBe('');
    expect(readParam('a=1&.user', '.user')).toBe('');
  });

  it('matches the key decoded', () => {
    expect(readParam('my%20.user=security', 'my .user')).toBe('security');
    expect(readParam('my .user=security', 'my .user')).toBe('security');
  });

  it('reads the first of repeated pairs', () => {
    expect(readParam('.user=a&.user=b', '.user')).toBe('a');
  });
});

describe('writeParam', () => {
  const others = 'q=a+b&path=%2Fx%2Fy&flag&&e=%C3%A9';

  it('replaces its pair in place and keeps every other pair byte for byte', () => {
    expect(writeParam(`${others}&.user=x&z=1`, '.user', 'security')).toBe(`${others}&.user=security&z=1`);
  });

  it('adds its pair last when there is none', () => {
    expect(writeParam(others, '.user', 'security')).toBe(`${others}&.user=security`);
    expect(writeParam('', '.user', '')).toBe('.user=');
  });

  it('removes its pair, and repeats of it', () => {
    expect(writeParam(`.user=a&${others}&.user=b`, '.user', undefined)).toBe(others);
    expect(writeParam('.user=a', '.user', undefined)).toBe('');
  });

  it('leaves a body without its pair alone when removing', () => {
    expect(writeParam(others, '.user', undefined)).toBe(others);
  });

  it('writes the key encoded', () => {
    expect(writeParam('', 'my .user', 'x')).toBe('my%20.user=x');
  });

  it.each(['%2Euser', '.%75ser', '%2euser'])('replaces the pair whose key %s reads as its key', raw => {
    const body = `a=1&${raw}=billing&z=2`;
    expect(readParam(body, '.user')).toBe('billing');

    const written = writeParam(body, '.user', 'security');
    expect(written).toBe('a=1&.user=security&z=2');
    expect(readParam(written, '.user')).toBe('security');

    expect(writeParam(body, '.user', undefined)).toBe('a=1&z=2');
  });

  it('reads a plus sign and %20 in a key alike as a space', () => {
    expect(writeParam('my+.user=a&b=1&my%20.user=c', 'my .user', 'x')).toBe('my%20.user=x&b=1');
    expect(writeParam('my+.user=a&b=1&my%20.user=c', 'my .user', undefined)).toBe('b=1');
  });

  it('leaves a pair whose key has a malformed escape untouched', () => {
    expect(writeParam('%E0%A4%A=1&%=2&.user=x', '.user', 'security')).toBe('%E0%A4%A=1&%=2&.user=security');
    expect(writeParam('%E0%A4%A=1&%=2', '.user', undefined)).toBe('%E0%A4%A=1&%=2');
  });
});
