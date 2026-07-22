import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo/google';
import { AuthView, UserButton } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';

import { E2EControls } from './components/E2EControls';
import { JsSignInForm } from './components/JsSignInForm';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

function NativeBuildFixture() {
  const { isLoaded, isSignedIn, signOut } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [googleResult, setGoogleResult] = useState<string | null>(null);
  const [e2eStatus, setE2eStatus] = useState<string | null>(null);

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
      {!isSignedIn && <JsSignInForm onStatus={setE2eStatus} />}
      {isSignedIn && <E2EControls onStatus={setE2eStatus} />}
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
});
