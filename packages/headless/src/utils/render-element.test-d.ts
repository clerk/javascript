import type React from 'react';
import { describe, expectTypeOf, test } from 'vitest';

import type { ComponentProps } from './render-element';

describe('render-element', () => {
  test('render prop arg is narrowed to the element tag props, not the generic HTMLAttributes<HTMLElement>', () => {
    type Props = ComponentProps<'button'>;
    type RenderArg = NonNullable<Props['render']> extends (props: infer P) => React.ReactElement ? P : never;
    expectTypeOf<RenderArg>().toEqualTypeOf<React.ComponentPropsWithRef<'button'>>();
  });
});
