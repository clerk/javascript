import { describe, expect, it } from 'vitest';

import { toSlug } from '../create-organization.utils';

describe('toSlug', () => {
  it('drops punctuation at the ends instead of leaving a hyphen', () => {
    expect(toSlug('Acme Inc.')).toBe('acme-inc');
    expect(toSlug('  (Acme)  ')).toBe('acme');
  });

  it('folds accented letters to their plain form', () => {
    expect(toSlug('Café Société')).toBe('cafe-societe');
  });

  it('collapses runs of separators into one hyphen', () => {
    expect(toSlug('Acme -- West & East')).toBe('acme-west-east');
  });
});
