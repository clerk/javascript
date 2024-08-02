import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, Button, View } from 'react-native';
import React from 'react';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, emailAddress, password]);

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
