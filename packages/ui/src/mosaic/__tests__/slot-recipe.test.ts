import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../appearance';
import { MosaicProvider } from '../MosaicProvider';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import { slot, useSlot } from '../useSlot';

function wrapper(appearance?: MosaicAppearance, scope?: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(MosaicProvider, { appearance, scope }, children);
  };
}

const buttonRecipe = defineSlotRecipe({
  slot: 'button',
  base: { display: 'inline-flex', '&[data-cl-disabled]': { opacity: 0.5 } },
  variants: {
    color: { primary: { color: 'white' }, danger: { color: 'red' } },
    size: { sm: { fontSize: 12 }, md: { fontSize: 14 } },
    loading: { false: {}, true: { cursor: 'wait' } },
  },
  compoundVariants: [{ color: 'danger', size: 'sm', css: { fontWeight: 700 } }],
  defaultVariants: { color: 'primary', size: 'md' },
});

describe('defineSlotRecipe / useRecipe', () => {
  it('single-slot shorthand exposes an implicit `root` slot', () => {
    expect(buttonRecipe.single).toBe(true);
    expect(buttonRecipe.slotKeys).toEqual(['root']);
    expect(buttonRecipe.slotMap.root).toBe('button');
  });

  it('applies base + default variants merged into one css object', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe), { wrapper: wrapper() });
    expect(result.current.root.css).toEqual({
      display: 'inline-flex',
      '&[data-cl-disabled]': { opacity: 0.5 },
      color: 'white', // default color: primary
      fontSize: 14, // default size: md
    });
    expect(result.current.root['data-cl-slot']).toBe('button');
  });

  it('selected variants override defaults', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe, { variants: { color: 'danger', size: 'sm' } }), {
      wrapper: wrapper(),
    });
    expect(result.current.root.css).toMatchObject({ color: 'red', fontSize: 12, fontWeight: 700 });
  });

  it('coerces boolean variants to string keys', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe, { variants: { loading: true } }), {
      wrapper: wrapper(),
    });
    expect(result.current.root.css).toMatchObject({ cursor: 'wait' });
  });

  it('resolution order is base → variants → compound → sx → appearance (later wins)', () => {
    const appearance: MosaicAppearance = { elements: { button: { color: 'green', fontSize: 99 } } };
    const { result } = renderHook(
      () => useRecipe(buttonRecipe, { variants: { color: 'danger' }, sx: { color: 'blue' } }),
      { wrapper: wrapper(appearance) },
    );
    // variant danger → color red, sx → color blue, appearance → color green (appearance is highest)
    expect(result.current.root.css.color).toBe('green');
    expect(result.current.root.css.fontSize).toBe(99);
  });

  it('emits resolved variants as data-cl-<axis> attributes (defaults included)', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe, { variants: { size: 'sm' } }), { wrapper: wrapper() });
    expect(result.current.root['data-cl-size']).toBe('sm');
    expect(result.current.root['data-cl-color']).toBe('primary'); // default still emitted, so md vs sm is targetable
  });

  it('uses presence semantics for boolean variants', () => {
    const { result: on } = renderHook(() => useRecipe(buttonRecipe, { variants: { loading: true } }), {
      wrapper: wrapper(),
    });
    expect(on.current.root['data-cl-loading']).toBe('');

    const { result: off } = renderHook(() => useRecipe(buttonRecipe, { variants: { loading: false } }), {
      wrapper: wrapper(),
    });
    expect(off.current.root).not.toHaveProperty('data-cl-loading');
  });

  it('maps truthy state to data-cl attributes and omits falsy ones', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe, { state: { disabled: true, loading: false } }), {
      wrapper: wrapper(),
    });
    expect(result.current.root['data-cl-disabled']).toBe('');
    expect(result.current.root).not.toHaveProperty('data-cl-loading');
  });

  it('preserves nested state-attribute appearance overrides through the merge', () => {
    const appearance: MosaicAppearance = {
      elements: { button: { '&[data-cl-disabled]': { opacity: 0.2 } } },
    };
    const { result } = renderHook(() => useRecipe(buttonRecipe), { wrapper: wrapper(appearance) });
    expect(result.current.root.css['&[data-cl-disabled]']).toEqual({ opacity: 0.2 });
  });

  it('sets className on root when appearance has a string override', () => {
    const appearance: MosaicAppearance = { elements: { button: 'bg-red-500' } };
    const { result } = renderHook(() => useRecipe(buttonRecipe), { wrapper: wrapper(appearance) });
    expect(result.current.root.className).toBe('bg-red-500');
  });

  it('joins className from global + scoped appearance layers', () => {
    const appearance: MosaicAppearance = { elements: { button: 'bg-red-500', signIn: { button: 'text-white' } } };
    const { result } = renderHook(() => useRecipe(buttonRecipe), { wrapper: wrapper(appearance, 'signIn') });
    expect(result.current.root.className).toBe('bg-red-500 text-white');
  });

  it('omits className from SlotProps when no string override is set', () => {
    const { result } = renderHook(() => useRecipe(buttonRecipe), { wrapper: wrapper() });
    expect(result.current.root.className).toBeUndefined();
  });
});

describe('conditions', () => {
  const hoverRecipe = defineSlotRecipe({
    slot: 'button',
    base: { color: 'black', _hover: { backgroundColor: 'white' } },
  });

  it('expands recipe-authored conditions into nested selectors', () => {
    const { result } = renderHook(() => useRecipe(hoverRecipe), { wrapper: wrapper() });
    expect(result.current.root.css).toEqual({
      color: 'black',
      '@media (hover: hover)': { '&:hover': { backgroundColor: 'white' } },
    });
  });

  it('lets a consumer override hover via appearance.elements._hover (consumer wins)', () => {
    const appearance: MosaicAppearance = { elements: { button: { _hover: { backgroundColor: 'red' } } } };
    const { result } = renderHook(() => useRecipe(hoverRecipe), { wrapper: wrapper(appearance) });
    expect(result.current.root.css).toEqual({
      color: 'black',
      '@media (hover: hover)': { '&:hover': { backgroundColor: 'red' } },
    });
  });

  it('expands conditions provided through sx', () => {
    const { result } = renderHook(() => useRecipe(hoverRecipe, { sx: { _focusVisible: { outline: '2px' } } }), {
      wrapper: wrapper(),
    });
    expect(result.current.root.css['&:focus-visible']).toEqual({ outline: '2px' });
  });

  it('expands conditions for non-recipe slots via useSlot', () => {
    const appearance: MosaicAppearance = { elements: { avatarBox: { _hover: { opacity: 0.8 } } } };
    const { result } = renderHook(() => useSlot('avatarBox'), { wrapper: wrapper(appearance) });
    expect(result.current.css).toEqual({
      '@media (hover: hover)': { '&:hover': { opacity: 0.8 } },
    });
  });
});

describe('multi-slot recipe', () => {
  const cardRecipe = defineSlotRecipe({
    slots: { root: { slot: 'card' }, header: { slot: 'cardHeader' }, body: { slot: 'cardBody' } },
    base: { root: { borderRadius: 8 }, header: { fontWeight: 600 }, body: {} },
    variants: {
      tone: {
        neutral: { root: { borderColor: 'gray' } },
        danger: { root: { borderColor: 'red', '&[data-cl-invalid]': { boxShadow: '0 0 1px red' } } },
      },
    },
    defaultVariants: { tone: 'neutral' },
  });

  it('emits one data-cl-slot per slot and resolves per-slot css', () => {
    const { result } = renderHook(
      () => useRecipe(cardRecipe, { variants: { tone: 'danger' }, state: { invalid: true } }),
      {
        wrapper: wrapper(),
      },
    );
    expect(result.current.root['data-cl-slot']).toBe('card');
    expect(result.current.header['data-cl-slot']).toBe('cardHeader');
    expect(result.current.body['data-cl-slot']).toBe('cardBody');
    expect(result.current.root.css).toMatchObject({
      borderRadius: 8,
      borderColor: 'red',
      '&[data-cl-invalid]': { boxShadow: '0 0 1px red' },
    });
    expect(result.current.header.css).toEqual({ fontWeight: 600 });
  });

  it('attaches state attributes to every slot', () => {
    const { result } = renderHook(() => useRecipe(cardRecipe, { state: { invalid: true } }), { wrapper: wrapper() });
    expect(result.current.root['data-cl-invalid']).toBe('');
    expect(result.current.header['data-cl-invalid']).toBe('');
    expect(result.current.body['data-cl-invalid']).toBe('');
  });
});

describe('useSlot / slot sugar', () => {
  it('slot() returns just the data-cl-slot attribute, no hook required', () => {
    expect(slot('avatarBox')).toEqual({ 'data-cl-slot': 'avatarBox' });
  });

  it('useSlot returns attrs + appearance-only css (no recipe styles)', () => {
    const appearance: MosaicAppearance = { elements: { avatarBox: { color: 'lime' } } };
    const { result } = renderHook(() => useSlot('avatarBox', { state: { disabled: true } }), {
      wrapper: wrapper(appearance),
    });
    expect(result.current['data-cl-slot']).toBe('avatarBox');
    expect(result.current['data-cl-disabled']).toBe('');
    expect(result.current.css).toEqual({ color: 'lime' });
  });

  it('useSlot merges sx before appearance overrides', () => {
    const appearance: MosaicAppearance = { elements: { avatarBox: { color: 'lime' } } };
    const { result } = renderHook(() => useSlot('avatarBox', { sx: { color: 'blue', padding: 4 } }), {
      wrapper: wrapper(appearance),
    });
    expect(result.current.css).toEqual({ color: 'lime', padding: 4 });
  });

  it('useSlot with no provider styling returns empty css and still emits the slot', () => {
    const { result } = renderHook(() => useSlot('avatarBox'), { wrapper: wrapper() });
    expect(result.current).toEqual({ 'data-cl-slot': 'avatarBox', css: {} });
  });

  it('useSlot sets className when appearance has a string override', () => {
    const appearance: MosaicAppearance = { elements: { avatarBox: 'rounded-full' } };
    const { result } = renderHook(() => useSlot('avatarBox'), { wrapper: wrapper(appearance) });
    expect(result.current.className).toBe('rounded-full');
  });
});

describe('type inference', () => {
  it('infers variant prop names and values', () => {
    // Type-only assertions — never executed, validated by `tsc` during type-check.
    () => {
      useRecipe(buttonRecipe, { variants: { color: 'danger', size: 'sm', loading: true } });
      // @ts-expect-error 'nope' is not a valid `color`
      useRecipe(buttonRecipe, { variants: { color: 'nope' } });
      // @ts-expect-error `loading` is a boolean variant, not a string
      useRecipe(buttonRecipe, { variants: { loading: 'true' } });
    };
    expect(true).toBe(true);
  });

  it('defaultVariants only accepts valid variant keys and values', () => {
    () => {
      defineSlotRecipe({
        slot: 'button',
        variants: { color: { primary: {}, danger: {} } },
        // @ts-expect-error 'nope' is not a valid color value
        defaultVariants: { color: 'nope' },
      });
      defineSlotRecipe({
        slot: 'button',
        variants: { color: { primary: {}, danger: {} } },
        // @ts-expect-error 'unknown' is not a declared variant axis
        defaultVariants: { unknown: 'primary' },
      });
    };
    expect(true).toBe(true);
  });

  it('compoundVariants entries only accept valid variant keys and values', () => {
    () => {
      defineSlotRecipe({
        slot: 'button',
        variants: { color: { primary: {}, danger: {} }, size: { sm: {}, md: {} } },
        compoundVariants: [
          // @ts-expect-error 'nope' is not a valid color value
          { color: 'nope', css: { fontWeight: 700 } },
        ],
      });
      defineSlotRecipe({
        slot: 'button',
        variants: { color: { primary: {}, danger: {} } },
        compoundVariants: [
          // @ts-expect-error 'unknown' is not a declared variant axis
          { unknown: 'primary', css: {} },
        ],
      });
    };
    expect(true).toBe(true);
  });
});
