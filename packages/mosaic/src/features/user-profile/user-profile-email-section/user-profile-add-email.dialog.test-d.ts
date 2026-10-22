import { describe, expectTypeOf, test } from 'vitest';

import type { ReverificationController } from '../../reverification';
import type { UserProfileAddEmailControllerOptions } from './user-profile-add-email.controller';
import type { UserProfileAddEmailDialogProps } from './user-profile-add-email.dialog';

type BaseProps = Omit<UserProfileAddEmailDialogProps, 'step' | 'reverification'>;

describe('UserProfileAddEmailDialogProps', () => {
  test('requires a controller for the reverification step', () => {
    expectTypeOf<BaseProps & { step: 'reverify' }>().not.toExtend<UserProfileAddEmailDialogProps>();
    expectTypeOf<
      BaseProps & { step: 'reverify'; reverification: undefined }
    >().not.toExtend<UserProfileAddEmailDialogProps>();
  });

  test('accepts a controller for every step', () => {
    expectTypeOf<
      BaseProps & { step: UserProfileAddEmailDialogProps['step']; reverification: ReverificationController }
    >().toExtend<UserProfileAddEmailDialogProps>();
  });

  test('requires a controller for the other steps too', () => {
    expectTypeOf<
      BaseProps & { step: 'email' | 'verify' | 'link' | 'sso' }
    >().not.toExtend<UserProfileAddEmailDialogProps>();
  });

  test('requires the add-email controller to receive reverification', () => {
    expectTypeOf<
      Omit<UserProfileAddEmailControllerOptions, 'reverification'>
    >().not.toExtend<UserProfileAddEmailControllerOptions>();
  });
});
