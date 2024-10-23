import { ClerkProvider, SignedIn, SignedOut, useAuth, useSignIn, useUser } from '@clerk/clerk-expo';
import { passkeys } from 'clerk-expo-passkeys';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';

import { usePasskeys } from './hooks/usePasskeys';

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.log(err);
    }
  },
};

const ProtectedView = () => {
  const { user: clerkUser } = useUser();
  const auth = useAuth();

  const passkeys = usePasskeys();

  const handleCreate = async () => {
    try {
      await passkeys?.createPasskey();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View
      style={{
        gap: 12,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#1D3D47',
        padding: 20,
      }}
    >
      <TouchableOpacity onPress={handleCreate}>
        <Text>Create passkey</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          auth.signOut();
        }}
      >
        <Text>Sign out</Text>
      </TouchableOpacity>
      {clerkUser && (
        <View>
          <Text style={{ color: 'cyan' }}>
            User with id <Text style={{ fontStyle: 'italic' }}>{clerkUser.id}</Text> and Username{' '}
            <Text style={{ fontStyle: 'italic' }}>{clerkUser.primaryEmailAddress?.toString()}</Text> is logged in{' '}
          </Text>
        </View>
      )}
    </View>
  );
};

const PublicView = () => {
  const { signInWithPasskey } = usePasskeys();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInWithPasskey = async () => {
    try {
      await signInWithPasskey();
    } catch (e) {
      if (e.clerkError) {
        console.log(e.errors[0].longMessage);
      }
      console.error(e);
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err) {
      if (e.clerkError) {
        console.log(e.errors[0].longMessage);
      }
      console.error(err);
    }
  };

  return (
    <View style={{ marginTop: 100, marginLeft: 10, gap: 15 }}>
      <View>
        <TextInput
          autoCapitalize='none'
          value={emailAddress}
          placeholder='Email...'
          textContentType='username'
          onChangeText={emailAddress => setEmailAddress(emailAddress)}
        />
      </View>

      <View>
        <TextInput
          value={password}
          placeholder='Password...'
          textContentType='password'
          onChangeText={password => setPassword(password)}
        />
      </View>

      <TouchableOpacity onPress={onSignInPress}>
        <Text>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSignInWithPasskey}>
        <Text>Sign in with passkey</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      passkeysFunc={passkeys}
    >
      <View style={styles.container}>
        <SignedIn>
          <ProtectedView />
        </SignedIn>
        <SignedOut>
          <PublicView />
        </SignedOut>
      </View>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
