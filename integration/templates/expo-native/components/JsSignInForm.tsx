import { useSignIn } from '@clerk/expo';
import { useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';

/**
 * Headless JS-runtime sign-in so the JS client owns the session, which the
 * native-token-divergence flow requires (the native AuthView would create the
 * session on the native client instead).
 */
export function JsSignInForm({ onStatus }: { onStatus: (status: string) => void }) {
  const { signIn } = useSignIn();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const reportError = (message: string) => onStatus(`sign-in-error ${message}`.replace(/\s+/g, ' ').trim());

  const onJsSignIn = async () => {
    try {
      const { error } = await signIn.password({ identifier, password });
      if (error) {
        reportError(error.message ?? '');
        return;
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        reportError(finalizeError.message ?? '');
      }
    } catch (error) {
      reportError(String(error));
    }
  };

  return (
    <>
      <TextInput
        testID='e2e-identifier-input'
        style={styles.input}
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='e2e identifier'
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        testID='e2e-password-input'
        style={styles.input}
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry
        placeholder='e2e secret'
        value={password}
        onChangeText={setPassword}
      />
      <Button
        testID='e2e-js-sign-in-button'
        title='E2E JS sign in'
        onPress={() => void onJsSignIn()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#cccccc',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
