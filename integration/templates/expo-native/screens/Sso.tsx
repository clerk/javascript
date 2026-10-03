import { useSSO } from '@clerk/expo';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

import { styles } from './styles';

export function Sso() {
  const { startSSOFlow } = useSSO();
  const [result, setResult] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setResult('started');
    try {
      const { createdSessionId, setActive, authSessionResult } = await startSSOFlow({ strategy: 'oauth_google' });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        setResult('complete');
      } else {
        setResult(authSessionResult?.type ?? 'incomplete');
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>SSO</Text>
      <Button
        testID='verify.sso.google'
        title='Continue with Google'
        onPress={() => void signInWithGoogle()}
      />
      {result && <Text testID='verify.sso.result'>{`sso: ${result}`}</Text>}
    </View>
  );
}
