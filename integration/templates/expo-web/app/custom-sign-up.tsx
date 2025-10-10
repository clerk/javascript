import * as React from 'react';
import { TextInput, Button, View } from 'react-native';
import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    // try {
    //   await signUp.create({
    //     emailAddress,
    //     password,
    //   });

    //   await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

    //   setPendingVerification(true);
    // } catch (err: any) {
    //   // See https://clerk.com/docs/custom-flows/error-handling
    //   // for more info on error handling
    //   console.error(JSON.stringify(err, null, 2));
    // }
    await signUp.password({ emailAddress, password });
    await signUp.verifications.sendEmailCode({ emailAddress });
    setPendingVerification(true);
  };

  const onPressVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: async () => {
          router.replace('/');
        },
      });
    }
  };

  return (
    <View>
      {!pendingVerification && (
        <>
          <TextInput
            autoCapitalize='none'
            value={emailAddress}
            placeholder='Email...'
            onChangeText={email => setEmailAddress(email)}
            id='emailAddress'
            testID='emailAddress-input'
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
            title='Sign Up'
            onPress={onSignUpPress}
          />
        </>
      )}
      {pendingVerification && (
        <>
          <TextInput
            value={code}
            placeholder='Code...'
            onChangeText={code => setCode(code)}
            testID='code-input'
          />
          <Button
            title='Verify Email'
            onPress={onPressVerify}
          />
        </>
      )}
    </View>
  );
}
