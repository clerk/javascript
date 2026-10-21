import { describe, expectTypeOf, test } from 'vitest';

import type { ReverificationController } from '../../reverification';
import type { UserProfileAddEmailDialogProps } from './user-profile-add-email.dialog';

type BaseProps = Omit<UserProfileAddEmailDialogProps, 'step' | 'reverification'>;

describe('UserProfileAddEmailDialogProps', () => {
  test('requires a controller for the reverification step', () => {
    expectTypeOf<BaseProps & { step: 'reverify' }>().not.toExtend<UserProfileAddEmailDialogProps>();
    expectTypeOf<
      BaseProps & { step: 'reverify'; reverification: undefined }
    >().not.toExtend<UserProfileAddEmailDialogProps>();
  });

  test('accepts a controller for the reverification step', () => {
    expectTypeOf<
      BaseProps & { step: 'reverify'; reverification: ReverificationController }
    >().toExtend<UserProfileAddEmailDialogProps>();
  });

  test('allows the other steps without a controller', () => {
    expectTypeOf<
      BaseProps & { step: 'email' | 'verify' | 'link' | 'sso' }
    >().toExtend<UserProfileAddEmailDialogProps>();
  });
});
