import { describe, expect, it } from 'vitest';

import type { ParsedMosaicElements } from '../appearance';
import { resolveSlotClassName, resolveSlotCss } from '../resolveSlot';

describe('resolveSlotCss', () => {
  it('returns [] when there are no layers', () => {
    expect(resolveSlotCss('button', [])).toEqual([]);
  });

  it('returns [] when no layer targets the slot', () => {
    const parsed: ParsedMosaicElements = [{ input: { color: 'red' } }];
    expect(resolveSlotCss('button', parsed)).toEqual([]);
  });

  it('returns the single matching override', () => {
    const parsed: ParsedMosaicElements = [{ button: { color: 'lime' } }];
    expect(resolveSlotCss('button', parsed)).toEqual([{ color: 'lime' }]);
  });

  it('returns matching overrides in layer order (low → high)', () => {
    const parsed: ParsedMosaicElements = [
      { button: { color: 'green' } }, // global
      { button: { color: 'red' } }, // scoped — wins because it comes later
    ];
    expect(resolveSlotCss('button', parsed)).toEqual([{ color: 'green' }, { color: 'red' }]);
  });

  it('skips layers that do not target the slot but keeps the rest', () => {
    const parsed: ParsedMosaicElements = [
      { button: { color: 'green' } },
      { input: { color: 'blue' } },
      { button: { color: 'red' } },
    ];
    expect(resolveSlotCss('button', parsed)).toEqual([{ color: 'green' }, { color: 'red' }]);
  });

  it('ignores className string overrides (only object style rules are returned)', () => {
    const parsed: ParsedMosaicElements = [{ button: 'MyButton' }, { button: { color: 'red' } }];
    expect(resolveSlotCss('button', parsed)).toEqual([{ color: 'red' }]);
  });

  it('preserves nested state-attribute selectors', () => {
    const parsed: ParsedMosaicElements = [{ button: { color: 'red', '&[data-cl-disabled]': { opacity: 0.4 } } }];
    expect(resolveSlotCss('button', parsed)).toEqual([{ color: 'red', '&[data-cl-disabled]': { opacity: 0.4 } }]);
  });
});

describe('resolveSlotClassName', () => {
  it('returns undefined when no layers exist', () => {
    expect(resolveSlotClassName('button', [])).toBeUndefined();
  });

  it('returns undefined when no string override exists', () => {
    expect(resolveSlotClassName('button', [{ button: { color: 'red' } }])).toBeUndefined();
  });

  it('returns the className from a single layer', () => {
    expect(resolveSlotClassName('button', [{ button: 'bg-red-500' }])).toBe('bg-red-500');
  });

  it('joins classNames from multiple layers space-separated', () => {
    expect(resolveSlotClassName('button', [{ button: 'bg-red-500' }, { button: 'text-white' }])).toBe(
      'bg-red-500 text-white',
    );
  });

  it('skips object overrides and layers that miss the slot', () => {
    expect(resolveSlotClassName('button', [{ button: { color: 'red' } }, { input: 'foo' }, { button: 'bar' }])).toBe(
      'bar',
    );
  });
});
