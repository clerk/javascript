import { useAuth } from '@clerk/expo';
import { requireOptionalNativeModule } from 'expo';
import { Button, StyleSheet, View } from 'react-native';

// Fixture-local Maestro hook (modules/e2e-hooks); android-only, null elsewhere.
const E2EHooks = requireOptionalNativeModule<{ corruptNativeDeviceToken(): Promise<boolean> }>('E2EHooks');

/**
 * Signed-in controls for the native-token-divergence regression flow.
 */
export function E2EControls({ onStatus }: { onStatus: (status: string | null) => void }) {
  const { getToken } = useAuth({ treatPendingAsSignedOut: false });

  const onCorruptNativeToken = async () => {
    onStatus(null);
    try {
      const didCorrupt = await E2EHooks?.corruptNativeDeviceToken();
      // Delay the marker so Maestro cannot race the native client event and
      // the JS sync settling.
      setTimeout(() => onStatus(didCorrupt ? 'corrupt-done' : 'corrupt-failed'), 3000);
    } catch {
      onStatus('corrupt-failed');
    }
  };

  const onMintSessionToken = async () => {
    onStatus(null);
    try {
      const token = await getToken({ skipCache: true });
      onStatus(token ? 'token-ok' : 'token-empty');
    } catch {
      onStatus('token-error');
    }
  };

  return (
    <View style={styles.e2eRow}>
      <Button
        testID='e2e-corrupt-native-token-button'
        title='Corrupt'
        onPress={() => void onCorruptNativeToken()}
      />
      <Button
        testID='e2e-refresh-token-button'
        title='Mint'
        onPress={() => void onMintSessionToken()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  e2eRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
