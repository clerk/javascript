import React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { StyleRule } from '../slot-recipe';
import { withMosaicSlot } from './withMosaicSlot';

type RenderProp = (props: React.HTMLAttributes<HTMLElement>) => React.ReactElement;

// Minimal ForwardRefExoticComponent (the shape returned by React.forwardRef — same as every headless primitive)
const FRE = React.forwardRef<HTMLDivElement, { className?: string; render?: RenderProp }>((props, ref) =>
  React.createElement('div', { ...props, ref }),
);

// Minimal FunctionComponent
const FC: React.FunctionComponent<{ id: string }> = ({ id }) => React.createElement('span', { id });

describe('withMosaicSlot', () => {
  test('render prop is correctly typed when wrapping a ForwardRefExoticComponent', () => {
    const Wrapped = withMosaicSlot(FRE);
    type Props = React.ComponentPropsWithoutRef<typeof Wrapped>;
    // Must not be any — toEqualTypeOf fails if either side is any
    expectTypeOf<Props['render']>().toEqualTypeOf<RenderProp | undefined>();
  });

  test('original props pass through when wrapping a ForwardRefExoticComponent', () => {
    const Wrapped = withMosaicSlot(FRE);
    type Props = React.ComponentPropsWithoutRef<typeof Wrapped>;
    expectTypeOf<Props['className']>().toEqualTypeOf<string | undefined>();
  });

  test('css slot prop is added as optional', () => {
    const Wrapped = withMosaicSlot(FRE);
    type Props = React.ComponentPropsWithoutRef<typeof Wrapped>;
    expectTypeOf<Props['css']>().toEqualTypeOf<StyleRule | undefined>();
  });

  test('original props pass through when wrapping a FunctionComponent', () => {
    const Wrapped = withMosaicSlot(FC);
    type Props = React.ComponentPropsWithoutRef<typeof Wrapped>;
    expectTypeOf<Props['id']>().toEqualTypeOf<string>();
  });

  test('ref is narrowed to the element type, not unknown', () => {
    const Wrapped = withMosaicSlot(FRE);
    // FRE is forwardRef<HTMLDivElement, ...> — ref must resolve to HTMLDivElement
    type Ref = React.ComponentPropsWithRef<typeof Wrapped>['ref'];
    expectTypeOf<Ref>().toEqualTypeOf<React.Ref<HTMLDivElement> | undefined>();
  });
});
