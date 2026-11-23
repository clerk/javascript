import { type ReactElement } from 'react';
import { Text, View } from 'react-native';

import { BiometricAvailabilityButton } from '../components/BiometricAvailabilityButton';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { styles } from './styles';

export function NativeModules(): ReactElement {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Native modules</Text>
      <GoogleSignInButton />
      <BiometricAvailabilityButton />
    </View>
  );
}
