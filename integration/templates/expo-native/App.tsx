import { ClerkProvider, useAuth, useSignIn, useUser } from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo/google';
import { AuthView, UserButton } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { requireOptionalNativeModule } from 'expo';
import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

// Fixture-local Maestro hook (modules/e2e-hooks); android-only, null elsewhere.
const E2EHooks = requireOptionalNativeModule<{ corruptNativeDeviceToken(): Promise<boolean> }>('E2EHooks');

function NativeBuildFixture() {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { signIn } = useSignIn();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [googleResult, setGoogleResult] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [e2eStatus, setE2eStatus] = useState<string | null>(null);

  const onJsSignIn = async () => {
    try {
      const { error } = await signIn.password({ identifier, password });
      if (error) {
        setE2eStatus(`sign-in-error ${error.message ?? ''}`.replace(/\s+/g, ' ').trim());
        return;
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setE2eStatus(`sign-in-error ${finalizeError.message ?? ''}`.replace(/\s+/g, ' ').trim());
      }
    } catch (error) {
      setE2eStatus(`sign-in-error ${String(error)}`.replace(/\s+/g, ' '));
    }
  };

  const onCorruptNativeToken = async () => {
    setE2eStatus(null);
    try {
      const didCorrupt = await E2EHooks?.corruptNativeDeviceToken();
      // Delay the marker so Maestro cannot race the native client event and
      // the JS sync settling.
      setTimeout(() => setE2eStatus(didCorrupt ? 'corrupt-done' : 'corrupt-failed'), 3000);
    } catch {
      setE2eStatus('corrupt-failed');
    }
  };

  const onMintSessionToken = async () => {
    setE2eStatus(null);
    try {
      const token = await getToken({ skipCache: true });
      setE2eStatus(token ? 'token-ok' : 'token-empty');
    } catch {
      setE2eStatus('token-error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clerk Expo Native Fixture</Text>
        {isSignedIn && <UserButton />}
      </View>

      <Text testID='auth-state'>{isLoaded ? `signed ${isSignedIn ? 'in' : 'out'}` : 'loading'}</Text>
      {user?.id && <Text testID='user-id'>{user.id}</Text>}
      <Button
        testID='open-auth-view-button'
        title='Open native AuthView'
        onPress={() => setIsAuthOpen(true)}
      />
      {!isSignedIn && (
        <Button
          testID='google-sign-in-button'
          title='Sign in with Google'
          onPress={() => {
            void startGoogleAuthenticationFlow().catch((error: unknown) => {
              const message = error instanceof Error ? error.message : String(error);
              setGoogleResult(message.replace(/\s+/g, ' '));
            });
          }}
        />
      )}
      {googleResult && <Text testID='google-result'>{googleResult}</Text>}
      {!isSignedIn && (
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
      )}
      {isSignedIn && (
        <View style={styles.e2eRow}>
          <Button
            testID='e2e-corrupt-native-token-button'
            title='Corrupt'
            onPress={() => void onCorruptNativeToken()}
          />
          <Button
            testID='e2e-refresh-token-button'
            title='Mint'
            onPress={() => void onMintSessionToken()}
          />
        </View>
      )}
      {e2eStatus && <Text testID='e2e-status'>{e2eStatus}</Text>}
      {isSignedIn && (
        <Button
          testID='sign-out-button'
          title='Sign out'
          onPress={() => void signOut()}
        />
      )}

      <Modal
        animationType='slide'
        visible={isAuthOpen}
        presentationStyle='pageSheet'
        onRequestClose={() => setIsAuthOpen(false)}
      >
        <AuthView onDismiss={() => setIsAuthOpen(false)} />
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <NativeBuildFixture />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  e2eRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  input: {
    borderColor: '#cccccc',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
});
