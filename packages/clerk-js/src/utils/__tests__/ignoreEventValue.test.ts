import { describe, expect, it } from 'vitest';

import { ignoreEventValue } from '../ignoreEventValue';

const noop = (..._args: any[]): void => {
  // do nothing.
};

describe('ignoreNonEventValue', () => {
  it('allows non event values', () => {
    expect(ignoreEventValue(true)).toEqual(true);
    expect(ignoreEventValue({ name: 'test' })).toEqual({ name: 'test' });
    expect(ignoreEventValue(undefined)).toEqual(undefined);
    expect(ignoreEventValue(null)).toEqual(null);
    expect(ignoreEventValue(null)).toEqual(null);
    expect(ignoreEventValue(0)).toEqual(0);
    expect(ignoreEventValue(10)).toEqual(10);
    expect(ignoreEventValue('')).toEqual('');
  });

  it('ignores event values', () => {
    expect(ignoreEventValue(new Event('click'))).toEqual(undefined);
    expect(
      ignoreEventValue({
        target: '',
        currentTarget: '',
        preventDefault: noop,
      }),
    ).toEqual(undefined);
  });

  it('ignores synthetic event values (react)', () => {
    expect(
      ignoreEventValue({
        get target() {
          return null;
        },
        get currentTarget() {
          return null;
        },
        get preventDefault() {
          return null;
        },
      }),
    ).toEqual(undefined);
  });

  it('only allows values of specified types', () => {
    expect(ignoreEventValue(noop)).toEqual(noop);
    expect(ignoreEventValue(noop, { requireType: 'function' })).toEqual(noop);
    expect(ignoreEventValue(true, { requireType: 'function' })).toEqual(undefined);
    expect(ignoreEventValue(true, { requireType: 'boolean' })).toEqual(true);
  });
});
