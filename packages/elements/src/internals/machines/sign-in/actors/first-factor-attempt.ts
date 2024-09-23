import type {
  AttemptFirstFactorParams,
  EmailCodeAttempt,
  LoadedClerk,
  PasswordAttempt,
  PhoneCodeAttempt,
  ResetPasswordEmailCodeAttempt,
  ResetPasswordPhoneCodeAttempt,
  SignInFirstFactor,
  SignInResource,
  Web3Attempt,
} from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';

import type { FormFields } from '../../form';
import { assertIsDefined } from '../../utils/assert';

export type AttemptFirstFactorInput = {
  clerk: LoadedClerk;
  currentFactor: SignInFirstFactor | null;
  fields: FormFields;
};
export type AttemptFirstFactorOuput = SignInResource;

export const firstFactorAttempt = fromPromise<AttemptFirstFactorOuput, AttemptFirstFactorInput>(async ({ input }) => {
  const { clerk, currentFactor, fields } = input;
  assertIsDefined(currentFactor, 'Current factor');

  let attemptParams: AttemptFirstFactorParams;

  const strategy = currentFactor.strategy;
  const code = fields.get('code')?.value as string | undefined;
  const password = fields.get('password')?.value as string | undefined;

  switch (strategy) {
    case 'passkey': {
      return await clerk.client.signIn.authenticateWithPasskey();
    }
    case 'password': {
      assertIsDefined(password, 'Password');

      attemptParams = {
        strategy,
        password,
      } satisfies PasswordAttempt;

      break;
    }
    case 'reset_password_phone_code':
    case 'reset_password_email_code': {
      assertIsDefined(code, 'Code for resetting phone/email');

      attemptParams = {
        strategy,
        code,
        password,
      } satisfies ResetPasswordPhoneCodeAttempt | ResetPasswordEmailCodeAttempt;

      break;
    }
    case 'phone_code':
    case 'email_code': {
      assertIsDefined(code, 'Code for phone/email');

      attemptParams = {
        strategy,
        code,
      } satisfies PhoneCodeAttempt | EmailCodeAttempt;

      break;
    }
    case 'web3_metamask_signature': {
      const signature = fields.get('signature')?.value as string | undefined;
      assertIsDefined(signature, 'Web3 Metamask signature');

      attemptParams = {
        strategy,
        signature,
      } satisfies Web3Attempt;

      break;
    }
    case 'web3_coinbase_wallet_signature': {
      const signature = fields.get('signature')?.value as string | undefined;
      assertIsDefined(signature, 'Web3 Coinbase Wallet signature');

      attemptParams = {
        strategy,
        signature,
      } satisfies Web3Attempt;

      break;
    }
    default:
      throw new ClerkElementsRuntimeError(`Invalid strategy: ${strategy}`);
  }

  return await clerk.client.signIn.attemptFirstFactor(attemptParams);
});
