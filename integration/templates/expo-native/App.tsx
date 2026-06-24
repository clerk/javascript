import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { AuthView, UserButton } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

function NativeBuildFixture() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clerk Expo Native Fixture</Text>
        {isSignedIn && <UserButton />}
      </View>

      <Text testID='auth-state'>{isLoaded ? `signed ${isSignedIn ? 'in' : 'out'}` : 'loading'}</Text>
      {user?.id && <Text testID='user-id'>{user.id}</Text>}
      <Button
        title='Open native AuthView'
        onPress={() => setIsAuthOpen(true)}
      />

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
    gap: 16,
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
