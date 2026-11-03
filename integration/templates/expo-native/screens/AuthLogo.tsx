import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AuthLogo(): ReactElement {
  return (
    <View style={styles.logo}>
      <Text style={styles.logoText}>E2E Custom Logo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: '#6C47FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
