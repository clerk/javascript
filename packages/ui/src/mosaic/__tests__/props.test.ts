import { describe, expect, it } from 'vitest';

import { mergeStyleProps, themeProps } from '../props';

// The public styling contract lives here, not in any one component: the stable
// `.cl-<slot>` class, `data-<axis>` variant reflection, and the class/style merge
// order that lets a later bag win. Components just wire their props into these
// helpers, so this is where the contract is exhaustively pinned.

describe('themeProps', () => {
  it('returns the stable slot class', () => {
    expect(themeProps('button')).toEqual({ className: 'cl-button' });
  });

  it('reflects each variant axis as a data-<axis> attribute', () => {
    expect(themeProps('button', { color: 'negative', variant: 'outline' })).toEqual({
      className: 'cl-button',
      'data-color': 'negative',
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

describe('mergeStyleProps', () => {
  it('concatenates className across bags, base first', () => {
    const merged = mergeStyleProps({ className: 'cl-button' }, { className: 'x1 x2' });
    expect(merged.className).toBe('cl-button x1 x2');
  });

  it('shallow-merges style with the later bag winning', () => {
    const merged = mergeStyleProps({ style: { marginTop: '2px', color: 'red' } }, { style: { marginTop: '8px' } });
    expect(merged.style).toEqual({ marginTop: '8px', color: 'red' });
  });

  it('skips undefined bags', () => {
    const merged = mergeStyleProps({ className: 'cl-button' }, undefined, { className: 'x1' });
    expect(merged.className).toBe('cl-button x1');
  });

  it('drops className entirely when nothing contributes one', () => {
    expect(mergeStyleProps({ 'data-color': 'primary' }, {})).not.toHaveProperty('className');
  });

  it('preserves non-class/style props from every bag, later bags winning', () => {
    const merged = mergeStyleProps({ 'data-color': 'primary', role: 'note' }, { role: 'button' }, { id: 'x' });
    expect(merged).toMatchObject({ 'data-color': 'primary', role: 'button', id: 'x' });
  });

  it("merges a render source's className/style out of the incoming prop bag", () => {
    // `Dialog.Title render={<Heading />}` hands Heading the title's merged pair through its
    // props; passing that bag last must merge them rather than clobber the part's own class.
    const rest = { className: 'cl-dialog-title', style: { color: 'red' }, id: 'title' };
    const merged = mergeStyleProps({ className: 'cl-heading' }, { className: 'x1', style: { margin: 0 } }, rest);
    expect(merged).toEqual({
      className: 'cl-heading x1 cl-dialog-title',
      style: { margin: 0, color: 'red' },
      id: 'title',
    });
  });
});
