import { describe, expect, it } from 'vitest';

import { createInternalTheme } from '../createInternalTheme';

describe('createInternalTheme', () => {
  it('handles empty objects', () => {
    const foundations = {};
    const res = createInternalTheme(foundations as any);
    expect(res).toEqual({});
  });

  it('handles empty objects', () => {
    const foundations = {
      colors: {
        primary500: 'primary500',
        primary50: 'primary50',
      },
      radii: {
        1: '1',
        2: '2',
      },
      sizes: {},
      spaces: undefined,
    };
    const res = createInternalTheme(foundations as any);
    expect(res).toEqual({
      colors: {
        $primary500: 'primary500',
        $primary50: 'primary50',
      },
      radii: {
        $1: '1',
        $2: '2',
      },
      sizes: {},
      spaces: {},
    });
  });
});
