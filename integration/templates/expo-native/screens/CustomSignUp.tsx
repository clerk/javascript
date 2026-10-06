import { useSignUp } from '@clerk/expo';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { styles } from './styles';

export function CustomSignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = fetchStatus === 'fetching';

  const sendCode = async () => {
    const created = await signUp.create({ emailAddress, password });
    const sent = created.error ? created : await signUp.verifications.sendEmailCode();
    setError(sent.error?.message ?? null);
    setCodeSent(!sent.error);
  };

  const verifyCode = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error || signUp.status !== 'complete') {
      setError(error?.message ?? `Sign-up is ${signUp.status}`);
      return;
    }
    const finalized = await signUp.finalize();
    setError(finalized.error?.message ?? null);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Custom sign-up</Text>
      {codeSent ? (
        <>
          <TextInput
            testID='verify.customSignUp.code'
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder='Email code'
            keyboardType='number-pad'
            autoComplete='one-time-code'
          />
          <Button
            testID='verify.customSignUp.verifyCode'
            title='Verify code'
            disabled={busy}
            onPress={() => void verifyCode()}
          />
        </>
      ) : (
        <>
          <TextInput
            testID='verify.customSignUp.emailAddress'
            style={styles.input}
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder='Email address'
            autoCapitalize='none'
            keyboardType='email-address'
          />
          <TextInput
            testID='verify.customSignUp.password'
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder='Password'
            secureTextEntry
            textContentType='oneTimeCode'
          />
          <Button
            testID='verify.customSignUp.sendCode'
            title='Send code'
            disabled={busy}
            onPress={() => void sendCode()}
          />
        </>
      )}
      {error && <Text testID='verify.customSignUp.error'>{error}</Text>}
    </View>
  );
}
