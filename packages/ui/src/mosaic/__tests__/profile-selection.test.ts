import { describe, expect, it } from 'vitest';

import { toggleVisibleSelection } from '../profile-selection';

describe('toggleVisibleSelection', () => {
  it('adds visible rows without dropping hidden selections', () => {
    expect(toggleVisibleSelection(['hidden'], ['visible-1', 'visible-2'])).toEqual([
      'hidden',
      'visible-1',
      'visible-2',
    ]);
  });

  it('removes only visible rows when all of them are selected', () => {
    expect(toggleVisibleSelection(['hidden', 'visible-1', 'visible-2'], ['visible-1', 'visible-2'])).toEqual([
      'hidden',
    ]);
  });

  it('does not duplicate a partially selected visible row', () => {
    expect(toggleVisibleSelection(['hidden', 'visible-1'], ['visible-1', 'visible-2'])).toEqual([
      'hidden',
      'visible-1',
      'visible-2',
    ]);
  });
});
