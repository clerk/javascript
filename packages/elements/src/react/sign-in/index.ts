// Mark as a client-only package. This will error if you try to import it in a React Server Component.
import 'client-only';

export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export { SignInStep as Step } from './step';
export { SignInAction as Action } from './action';
export { SignInPasskey as Passkey } from './passkey';
export { SignInCaptcha as Captcha } from './captcha';
export { SignInSupportedStrategy as SupportedStrategy } from './choose-strategy';
export { SignInSessionList as SessionList, SignInSessionListItem as SessionListItem } from './choose-session';

export {
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
  SignInStrategy as Strategy,
} from './verifications';

export { SignInSafeIdentifier as SafeIdentifier, SignInSalutation as Salutation } from './identifiers';
