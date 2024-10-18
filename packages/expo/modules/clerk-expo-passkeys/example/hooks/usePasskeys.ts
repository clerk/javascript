import { useSignIn, useUser } from '@clerk/clerk-expo';

export const usePasskeys = () => {
  const { user: clerkUser } = useUser();
  const { signIn: clerkSignIn, setActive, isLoaded } = useSignIn();

  const createPasskey = async () => {
    if (!clerkUser) {
      return null;
    }
    try {
      return await clerkUser.createPasskey();
    } catch (e) {
      throw e;
    }
  };

  const signInWithPasskey = async () => {
    if (!isLoaded) {
      return null;
    }
    try {
      const signinResponse = await clerkSignIn.authenticateWithPasskey({
        flow: 'discoverable',
      });

      await setActive({ session: signinResponse.createdSessionId });
      return signinResponse;
    } catch (e) {
      throw e;
    }
  };

  return { createPasskey, signInWithPasskey };
};
