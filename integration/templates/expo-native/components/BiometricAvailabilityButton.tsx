import { useBiometricCredentials } from '@clerk/expo/biometrics';
import { useState } from 'react';
import { Button, Text } from 'react-native';

export function BiometricAvailabilityButton() {
  const { getAvailability } = useBiometricCredentials();
  const [result, setResult] = useState<string | null>(null);

  return (
    <>
      <Button
        testID='biometric-availability-button'
        title='Check biometric availability'
        onPress={() => {
          void getAvailability().then(
            availability => setResult(`biometric availability: ${availability.unavailableReason ?? 'available'}`),
            (error: unknown) => {
              const message = error instanceof Error ? error.message : String(error);
              setResult(`biometric availability failed: ${message.replace(/\s+/g, ' ')}`);
            },
          );
        }}
      />
      {result && <Text testID='biometric-availability-result'>{result}</Text>}
    </>
  );
}
