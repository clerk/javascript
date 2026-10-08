import { useSignInContext } from '../../contexts';

export const useSignInEmailLinkVerifyModel = () => {
  const { afterSignInUrl } = useSignInContext();
  return { afterSignInUrl };
};
