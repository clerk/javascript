import { describe, expect, it } from 'vitest';

import { initials } from '../initials';

describe('initials', () => {
  it.each([
    ['Acme app', 'AA'],
    ['linear', 'L'],
    ['  Jane   Q Doe ', 'JQ'],
    ['', '?'],
    ['   ', '?'],
  ])('turns %j into %j', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
