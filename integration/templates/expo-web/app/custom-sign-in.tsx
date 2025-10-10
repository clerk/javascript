import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, Button, View } from 'react-native';
import React from 'react';

export default function Page() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = React.useCallback(async () => {
    await signIn.password({ emailAddress, password });
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: async () => {
          router.replace('/');
        },
      });
    }
  }, [emailAddress, password]);

  return (
    <View>
      <TextInput
        autoCapitalize='none'
        value={emailAddress}
        placeholder='Email...'
        id='emailAddress'
        testID='emailAddress-input'
        onChangeText={emailAddress => setEmailAddress(emailAddress)}
      />
      <TextInput
        value={password}
        placeholder='Password...'
        secureTextEntry={true}
        id='password'
        testID='password-input'
        onChangeText={password => setPassword(password)}
      />
      <Button
        title='Sign In'
        onPress={onSignInPress}
      />
      <View>
        <Text>Don't have an account?</Text>
        <Link href='/sign-up'>
          <Text>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
