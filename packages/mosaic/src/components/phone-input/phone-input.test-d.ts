import { expectTypeOf, test } from 'vitest';

import type { XStyle } from '../../props';
import type { PhoneInputProps } from './phone-input';

test('styles the grouped root through xstyle only', () => {
  expectTypeOf<PhoneInputProps>().toHaveProperty('xstyle').toEqualTypeOf<XStyle | undefined>();
  expectTypeOf<PhoneInputProps>().not.toHaveProperty('className');
  expectTypeOf<PhoneInputProps>().not.toHaveProperty('style');
});
