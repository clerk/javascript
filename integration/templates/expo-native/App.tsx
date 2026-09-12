import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { AuthView, UserButton, UserProfileView } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';

import { GoogleSignInButton } from './components/GoogleSignInButton';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

function NativeBuildFixture() {
  const { isLoaded, isSignedIn, signOut } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isProfileOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.embeddedProfile}>
          <UserProfileView
            customPages={[
              {
                path: 'e2e-custom-page',
                label: 'E2E Custom Page',
                icon: 'key',
                placement: { type: 'after', row: 'security' },
                content: (
                  <View
                    testID='custom-page-content'
                    style={styles.customPage}
                  >
                    <Text style={styles.customPageText}>Rehosted RN body</Text>
                  </View>
                ),
              },
            ]}
            isDismissible={false}
            onHostBack={() => setIsProfileOpen(false)}
          />
        </View>
      </View>
    );
  }

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
      {!isSignedIn && <GoogleSignInButton />}
      {isSignedIn && (
        <Button
          testID='open-embedded-profile-button'
          title='Open embedded profile'
          onPress={() => setIsProfileOpen(true)}
        />
      )}
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
        <AuthView
          logo={
            <View
              testID='custom-logo'
              style={styles.customLogo}
            >
              <Text style={styles.customLogoText}>E2E Custom Logo</Text>
            </View>
          }
          onDismiss={() => setIsAuthOpen(false)}
        />
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
  embeddedProfile: {
    backgroundColor: '#FFFFFF',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  customLogo: {
    backgroundColor: '#6C47FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  customLogoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customPage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  customPageText: {
    fontSize: 16,
    fontWeight: '600',
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
