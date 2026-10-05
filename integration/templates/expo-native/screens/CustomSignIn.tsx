import { useSignIn } from '@clerk/expo';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { styles } from './styles';

export function CustomSignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = fetchStatus === 'fetching';

  const sendCode = async () => {
    const { error } = await signIn.emailCode.sendCode({ emailAddress });
    setError(error?.message ?? null);
    setCodeSent(!error);
  };

  const verifyCode = async () => {
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error || signIn.status !== 'complete') {
      setError(error?.message ?? `Sign-in is ${signIn.status}`);
      return;
    }
    const finalized = await signIn.finalize();
    setError(finalized.error?.message ?? null);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Custom sign-in</Text>
      {codeSent ? (
        <>
          <TextInput
            testID='verify.customSignIn.code'
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder='Email code'
            keyboardType='number-pad'
            autoComplete='one-time-code'
          />
          <Button
            testID='verify.customSignIn.verifyCode'
            title='Verify code'
            disabled={busy}
            onPress={() => void verifyCode()}
          />
        </>
      ) : (
        <>
          <TextInput
            testID='verify.customSignIn.emailAddress'
            style={styles.input}
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder='Email address'
            autoCapitalize='none'
            keyboardType='email-address'
          />
          <Button
            testID='verify.customSignIn.sendCode'
            title='Send code'
            disabled={busy}
            onPress={() => void sendCode()}
          />
        </>
      )}
      {error && <Text testID='verify.customSignIn.error'>{error}</Text>}
    </View>
  );
}
