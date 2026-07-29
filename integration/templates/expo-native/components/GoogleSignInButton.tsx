import { useSignInWithGoogle } from '@clerk/expo/google';
import { useState } from 'react';
import { Button, Text } from 'react-native';

export function GoogleSignInButton() {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const [result, setResult] = useState<string | null>(null);

  return (
    <>
      <Button
        testID='google-sign-in-button'
        title='Sign in with Google'
        onPress={() => {
          void startGoogleAuthenticationFlow().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            setResult(message.replace(/\s+/g, ' '));
          });
        }}
      />
      {result && <Text testID='google-result'>{result}</Text>}
    </>
  );
}
