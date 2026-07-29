import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { ComponentProps } from './use-render';

describe('use-render', () => {
  test('render prop arg is narrowed to the element tag props, not the generic HTMLAttributes<HTMLElement>', () => {
    type Props = ComponentProps<'button'>;
    type RenderFn = Extract<NonNullable<Props['render']>, (...args: never[]) => unknown>;
    type RenderArg = RenderFn extends (props: infer P) => React.ReactElement ? P : never;
    expectTypeOf<RenderArg>().toEqualTypeOf<React.ComponentPropsWithRef<'button'>>();
  });

  test('render also accepts an element to clone', () => {
    expectTypeOf<React.ReactElement>().toExtend<NonNullable<ComponentProps<'button'>['render']>>();
  });
});
