import { UserProfileView } from '@clerk/expo/native';
import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EmbeddedProfile({ onHostBack }: { onHostBack: () => void }): ReactElement {
  return (
    <UserProfileView
      customPages={[
        {
          path: 'e2e-custom-page',
          label: 'E2E Custom Page',
          icon: 'key',
          placement: { type: 'after', row: 'security' },
          content: (
            <View style={styles.customPage}>
              <Text style={styles.customPageText}>Rehosted RN body</Text>
            </View>
          ),
        },
      ]}
      isDismissible={false}
      onHostBack={onHostBack}
    />
  );
}

const styles = StyleSheet.create({
  customPage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  customPageText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
