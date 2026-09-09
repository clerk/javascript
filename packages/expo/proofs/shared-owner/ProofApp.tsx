import React, { useEffect, useRef, useState } from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { ClerkProvider, getClerkInstance, useAuth, useUser } from '@clerk/expo';
import { UserProfileView } from '@clerk/expo/native';
const key = 'pk_test_bmF0aXZlLWNvcmUuY2xlcmsuYWNjb3VudHMuZGV2JA==';
function Proof() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const owner = getClerkInstance();
  const original = useRef(owner);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRequests((globalThis as any).__clerkProof.requests.length), 250);
    return () => clearInterval(timer);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, gap: 5 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Expo shared-owner proof v6</Text>
        <Text testID='proof-owner'>
          Owner: {original.current === owner ? 'same' : 'CHANGED'} · Loaded: {String(isLoaded)} · Signed in:{' '}
          {String(isSignedIn)}
        </Text>
        <Text testID='proof-js-user'>
          JS user: {user?.firstName} {user?.lastName}
        </Text>
        <Text>
          Engine: {(globalThis as any).HermesInternal ? 'Hermes' : 'unknown'} · JavaScript HTTP: {requests}
        </Text>
        <Text style={{ fontSize: 10 }}>
          Last request: {(globalThis as any).__clerkProof.requests.at(-1)?.method}{' '}
          {(globalThis as any).__clerkProof.requests.at(-1)?.path}
        </Text>
        <Button
          title='Rename from JavaScript'
          onPress={() => user?.update({ firstName: 'JavaScript' }).catch(e => setError(String(e)))}
        />
        {!!error && <Text>{error}</Text>}
      </View>
      {isSignedIn && (
        <UserProfileView
          isDismissible={false}
          style={{ flex: 1 }}
        />
      )}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <ClerkProvider
      publishableKey={key}
      telemetry={false}
    >
      <Proof />
    </ClerkProvider>
  );
}
