import { useCoreSignIn } from '../../contexts';
import { useRouter } from '../../router/RouteContext';
import { useSignInPasskeyModel } from './sign-in-passkey.model';

export function useSignInFactorOnePasskeyModel() {
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const passkey = useSignInPasskeyModel(() => navigate('../factor-two'));

  return {
    identifier: signIn.identifier,
    avatarUrl: signIn.userData.imageUrl,
    requestKey: passkey.requestKey,
    canRun: passkey.canRun,
    authenticateWithPasskey: passkey.authenticateWithPasskey,
    goBack: () => navigate('../'),
  };
}
