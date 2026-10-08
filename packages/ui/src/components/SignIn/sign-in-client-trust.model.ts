import { useCoreSignIn } from '../../contexts';

export function useSignInClientTrustModel() {
  const signIn = useCoreSignIn();
  return { supportedSecondFactors: signIn.supportedSecondFactors };
}
