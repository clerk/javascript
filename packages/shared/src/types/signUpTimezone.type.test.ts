import { expectTypeOf, test } from 'vitest';

import type { SignUpCreateParams, SignUpUpdateParams } from './signUpCommon';
import type {
  SignUpFuturePasswordParams,
  SignUpFutureSSOParams,
  SignUpFutureTicketParams,
  SignUpFutureUpdateParams,
  SignUpFutureWeb3Params,
} from './signUpFuture';

type HasTimezone<T> = 'timezone' extends keyof T ? true : false;

test('timezone is available only on explicit sign-up creation params', () => {
  expectTypeOf<HasTimezone<SignUpCreateParams>>().toEqualTypeOf<true>();
  expectTypeOf<HasTimezone<SignUpUpdateParams>>().toEqualTypeOf<false>();
  expectTypeOf<HasTimezone<SignUpFutureUpdateParams>>().toEqualTypeOf<false>();
  expectTypeOf<HasTimezone<SignUpFuturePasswordParams>>().toEqualTypeOf<false>();
  expectTypeOf<HasTimezone<SignUpFutureSSOParams>>().toEqualTypeOf<false>();
  expectTypeOf<HasTimezone<SignUpFutureTicketParams>>().toEqualTypeOf<false>();
  expectTypeOf<HasTimezone<SignUpFutureWeb3Params>>().toEqualTypeOf<false>();
});
