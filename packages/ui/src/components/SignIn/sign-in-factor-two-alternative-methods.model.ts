import { useCoreSignIn } from '@/contexts';

export function useSignInFactorTwoAlternativeMethodsModel() {
  const { supportedSecondFactors } = useCoreSignIn();
  return { supportedSecondFactors };
}
