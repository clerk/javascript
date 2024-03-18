import {
  SignInSafeIdentifierSelector,
  SignInSalutationSelector,
} from '~/internals/machines/sign-in/selectors/sign-in.selectors';

import { SignInRouterCtx } from './context';

export function SignInSafeIdentifier(): string {
  return SignInRouterCtx.useSelector(SignInSafeIdentifierSelector);
}

export function SignInSalutation(): string {
  return SignInRouterCtx.useSelector(SignInSalutationSelector);
}
