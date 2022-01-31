import { toSentence } from './array';

describe('toSentence', () => {
  it('returns a single item as-is', () => {
    expect(toSentence(['xyz'])).toBe('xyz');
    expect(toSentence(['abc'])).toBe('abc');
  });

  it('joins multiple items but the last with a comma and the last with ", or"', () => {
    expect(toSentence(['abc', 'def'])).toBe('abc, or def');
    expect(toSentence(['qwe', 'zxc', 'asd'])).toBe('qwe, zxc, or asd');
  });

  it('returns empty string if passed an empty array', () => {
    expect(toSentence([])).toBe('');
  });
});
