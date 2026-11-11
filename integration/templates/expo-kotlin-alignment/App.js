import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { ClerkProvider, useAuth, useClerk } from '@clerk/expo';
import { AuthView, UserProfileView } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';

function Probe() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(false);
  const [mounted, setMounted] = useState(true);

  async function checkToken() {
    try {
      setMessage((await getToken()) ? 'Session token obtained' : 'No session token');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingBottom: 35 }}>
      <Text>Clerk Kotlin alignment probe</Text>
      <Text>
        Loaded: {String(isLoaded)}; signed in: {String(isSignedIn)}
      </Text>
      <Text>{message}</Text>
      <Button
        title={mounted ? 'Unmount native view' : 'Mount native view'}
        onPress={() => setMounted(!mounted)}
      />
      {isSignedIn && (
        <>
          <Button
            title='Check session token'
            onPress={checkToken}
          />
          <Button
            title='Toggle profile'
            onPress={() => setProfile(!profile)}
          />
          <Button
            title='Sign out'
            onPress={async () => {
              await signOut();
              setMessage('Signed out');
            }}
          />
        </>
      )}
      {mounted &&
        (isSignedIn ? profile ? <UserProfileView /> : <Text>Authenticated</Text> : <AuthView mode='signInOrUp' />)}
    </View>
  );
}

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey?.startsWith('pk_test_')) {
    return (
      <View style={{ padding: 40 }}>
        <Text>Set a development EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and rebuild.</Text>
      </View>
    );
  }
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <Probe />
    </ClerkProvider>
  );
}
