import { useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';

const clientTokenKey = '__clerk_client_jwt';

export function TokenCache() {
  const { user } = useUser();
  const [stored, setStored] = useState<boolean | null>(null);

  useEffect(() => {
    void tokenCache?.getToken(clientTokenKey).then(token => setStored(Boolean(token)));
  }, [user?.id]);

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Token cache</Text>
      <Text testID='verify.tokenCache.clientToken'>
        {`stored client token: ${stored === null ? 'checking' : stored ? 'present' : 'absent'}`}
      </Text>
      <Text testID='verify.tokenCache.user'>{`user: ${user?.id ?? 'none'}`}</Text>
    </View>
  );
}
