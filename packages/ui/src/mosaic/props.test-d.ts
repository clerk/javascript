import type * as stylex from '@stylexjs/stylex';
import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { MosaicComponentProps, MosaicElementProps } from './props';
import { mergeStyleProps, themeProps } from './props';

// A Mosaic part is styled from inside `packages/ui` through `xstyle`, and from outside through
// the `.cl-<slot>` / `data-<axis>` / `--cl-*` CSS contract. Neither path is `className` or
// `style`, so the canonical prop types drop both; every part inherits the omission from here.

describe('MosaicComponentProps', () => {
  test('accepts xstyle', () => {
    expectTypeOf<MosaicComponentProps<'div'>>()
      .toHaveProperty('xstyle')
      .toEqualTypeOf<stylex.StyleXStyles | undefined>();
  });

  test('rejects className and style', () => {
    expectTypeOf<MosaicComponentProps<'div'>>().not.toHaveProperty('className');
    expectTypeOf<MosaicComponentProps<'div'>>().not.toHaveProperty('style');
  });

  test('keeps render and the native props', () => {
    expectTypeOf<MosaicComponentProps<'button'>>().toHaveProperty('render');
    expectTypeOf<MosaicComponentProps<'button'>>().toHaveProperty('onClick');
    expectTypeOf<MosaicComponentProps<'button'>>().toHaveProperty('ref');
  });
});

describe('MosaicElementProps', () => {
  test('accepts xstyle', () => {
    expectTypeOf<MosaicElementProps<'button'>>()
      .toHaveProperty('xstyle')
      .toEqualTypeOf<stylex.StyleXStyles | undefined>();
  });

  test('rejects className and style', () => {
    expectTypeOf<MosaicElementProps<'button'>>().not.toHaveProperty('className');
    expectTypeOf<MosaicElementProps<'button'>>().not.toHaveProperty('style');
  });

  test('has no render', () => {
    expectTypeOf<MosaicElementProps<'button'>>().not.toHaveProperty('render');
  });
});

declare const optionRest: Omit<MosaicComponentProps<'div'>, 'xstyle'> & { value: string };

describe('mergeStyleProps', () => {
  // The last bag is a part's `rest`, so the merged result must stay as strictly typed as the part's
  // props: a required prop the part forwards (Combobox.Option's `value`) is still checked by the
  // element it lands on.
  test('keeps the incoming bag typed and adds the merged className/style', () => {
    const merged = mergeStyleProps(themeProps('combobox-option'), { className: 'x1' }, optionRest);

    expectTypeOf(merged).toHaveProperty('value').toEqualTypeOf<string>();
    expectTypeOf(merged).toHaveProperty('onClick').toEqualTypeOf<MosaicComponentProps<'div'>['onClick']>();
    expectTypeOf(merged).toHaveProperty('className').toEqualTypeOf<string | undefined>();
    expectTypeOf(merged).toHaveProperty('style').toEqualTypeOf<React.CSSProperties | undefined>();
  });

  test('accepts a bag that only carries className/style', () => {
    const merged = mergeStyleProps(themeProps('icon'), { className: 'x1' });
    expectTypeOf(merged).toHaveProperty('className').toEqualTypeOf<string | undefined>();
  });
});
