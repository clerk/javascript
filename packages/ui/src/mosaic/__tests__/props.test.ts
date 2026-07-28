import { describe, expect, it } from 'vitest';

import { mergeProps, themeProps } from '../props';

// The public styling contract lives here, not in any one component: the stable
// `.cl-<slot>` class, `data-<axis>` variant reflection, and the class/style merge
// order that lets a consumer's `className`/`style` win. Components just wire their
// props into these helpers, so this is where the contract is exhaustively pinned.

describe('themeProps', () => {
  it('returns the stable slot class', () => {
    expect(themeProps('button')).toEqual({ className: 'cl-button' });
  });

  it('reflects each variant axis as a data-<axis> attribute', () => {
    expect(themeProps('button', { intent: 'destructive', variant: 'outline' })).toEqual({
      className: 'cl-button',
      'data-intent': 'destructive',
      'data-variant': 'outline',
    });
  });

  it('kebab-cases camelCase axis names', () => {
    expect(themeProps('button', { fullWidth: 'yes' })).toHaveProperty('data-full-width', 'yes');
  });

  it('reflects a true boolean as an empty-string presence attribute', () => {
    expect(themeProps('button', { fullWidth: true })).toHaveProperty('data-full-width', '');
  });

  it('skips false, null, and undefined axes', () => {
    expect(themeProps('button', { a: false, b: null, c: undefined })).toEqual({ className: 'cl-button' });
  });

  it('stringifies numeric axis values', () => {
    expect(themeProps('button', { size: 0 })).toHaveProperty('data-size', '0');
  });
});

describe('mergeProps', () => {
  it('concatenates className across bags, base first', () => {
    const merged = mergeProps({ className: 'cl-button' }, { className: 'x1 x2' });
    expect(merged.className).toBe('cl-button x1 x2');
  });

  it('accepts a trailing string as an appended className', () => {
    const merged = mergeProps({ className: 'cl-button' }, { className: 'x1' }, 'consumer');
    expect(merged.className).toBe('cl-button x1 consumer');
  });

  it('accepts a trailing object as a style and lets it win', () => {
    const merged = mergeProps({ style: { marginTop: '2px', color: 'red' } }, undefined, { marginTop: '8px' });
    expect(merged.style).toEqual({ marginTop: '8px', color: 'red' });
  });

  it('disambiguates the trailing className and style pair by position', () => {
    const merged = mergeProps({ className: 'cl-button' }, undefined, 'consumer', { marginTop: '8px' });
    expect(merged.className).toBe('cl-button consumer');
    expect(merged.style).toEqual({ marginTop: '8px' });
  });

  it('treats a string second argument as a className', () => {
    expect(mergeProps({ className: 'cl-button' }, 'consumer').className).toBe('cl-button consumer');
  });

  it('drops className entirely when nothing contributes one', () => {
    expect(mergeProps({ 'data-intent': 'primary' }, {})).not.toHaveProperty('className');
  });

  it('preserves non-class/style props from both bags', () => {
    const merged = mergeProps({ 'data-intent': 'primary' }, { role: 'button' });
    expect(merged).toMatchObject({ 'data-intent': 'primary', role: 'button' });
  });
});
