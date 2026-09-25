import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { ComponentProps, RenderProps } from './use-render';

type RenderFn<Tag extends keyof React.JSX.IntrinsicElements> = Extract<
  NonNullable<ComponentProps<Tag>['render']>,
  (...args: never[]) => unknown
>;
type RenderArg<Tag extends keyof React.JSX.IntrinsicElements> =
  RenderFn<Tag> extends (props: infer P) => React.ReactElement ? P : never;
type HasColor<P> = 'color' extends keyof P ? true : false;

describe('use-render', () => {
  test('a part keeps its own tag props', () => {
    expectTypeOf<ComponentProps<'button'>>().toExtend<{ type?: 'button' | 'submit' | 'reset' }>();
  });

  test('the legacy `color` attribute is dropped, so it cannot widen a `color` variant', () => {
    expectTypeOf<HasColor<ComponentProps<'button'>>>().toEqualTypeOf<false>();
    expectTypeOf<HasColor<RenderArg<'button'>>>().toEqualTypeOf<false>();
  });

  test('the render arg is the tag-agnostic RenderProps, not the default tag props', () => {
    expectTypeOf<RenderArg<'button'>>().toEqualTypeOf<RenderProps>();
    expectTypeOf<RenderArg<'div'>>().toEqualTypeOf<RenderProps>();
  });

  test('render props spread onto an element other than the default tag', () => {
    // The point of `render`: a `div` part rendering an `<a>`. A tag-pinned `ref`
    // would make this fail, which is what every call site used to work around.
    expectTypeOf<RenderProps>().toExtend<React.ComponentPropsWithRef<'a'>>();
    expectTypeOf<RenderProps>().toExtend<React.ComponentPropsWithRef<'button'>>();
  });

  test('render also accepts an element to clone', () => {
    expectTypeOf<React.ReactElement>().toExtend<NonNullable<ComponentProps<'button'>['render']>>();
  });
});
