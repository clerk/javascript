import { ClerkProvider, Show, useAuth, useSignIn, useUser } from '@clerk/expo';
import { passkeys } from '@clerk/expo/passkeys';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const handleCreatePasskey = async () => {
    if (!clerkUser) {
      return;
    }
    try {
      return await clerkUser.createPasskey();
    } catch (e: any) {
      console.error(e.clerkError ? e.errors[0].longMessage : e.message);
    }
  };

  return (
    <View style={styles.protectedContainer}>
      <TouchableOpacity onPress={handleCreatePasskey}>
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
            User with id <Text style={styles.italic}>{clerkUser.id}</Text> and Username{' '}
            <Text style={styles.userInfo}>{clerkUser.primaryEmailAddress?.toString()}</Text> is logged in{' '}
          </Text>
        </View>
      )}
    </View>
  );
};

const PublicView = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handlePasswordSignIn = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      const signInResponse = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: signInResponse.createdSessionId });
    } catch (err: any) {
      console.error(err.clerkError ? err.errors[0].longMessage : err);
    }
  };

  const handlePasskeySignIn = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      const signInResponse = await signIn.authenticateWithPasskey({
        flow: 'discoverable',
      });
      await setActive({ session: signInResponse.createdSessionId });
    } catch (err: any) {
      console.error(`With code${err.code}, and message ${err.message}`);
    }
  };

  return (
    <View style={styles.publicContainer}>
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

      <TouchableOpacity onPress={handlePasswordSignIn}>
        <Text>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePasskeySignIn}>
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
      __experimental_passkeys={passkeys}
    >
      <View style={styles.container}>
        <Show when='signedIn'>
          <ProtectedView />
        </Show>
        <Show when='signedOut'>
          <PublicView />
        </Show>
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
  protectedContainer: {
    gap: 12,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1D3D47',
    padding: 20,
  },
  publicContainer: {
    marginTop: 100,
    marginLeft: 10,
    gap: 15,
  },
  input: {
    // Add input styles
  },
  userInfo: {
    color: 'cyan',
  },
  italic: {
    fontStyle: 'italic',
  },
});
