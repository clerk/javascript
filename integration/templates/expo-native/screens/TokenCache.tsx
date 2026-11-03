import { useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { type ReactElement, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';

const clientTokenKey = '__clerk_client_jwt';

export async function readClientTokenKept(): Promise<boolean> {
  return Boolean(await tokenCache?.getToken(clientTokenKey));
}

export function TokenCache({ keptAtLaunch }: { keptAtLaunch: Promise<boolean> }): ReactElement {
  const { isLoaded, user } = useUser();
  const [kept, setKept] = useState<boolean | null>(null);

  useEffect(() => {
    void keptAtLaunch.then(setKept);
  }, [keptAtLaunch]);

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Token cache</Text>
      <Text testID='verify.tokenCache.clientToken'>
        {`client token kept from the last launch: ${kept === null ? 'checking' : kept ? 'yes' : 'no'}`}
      </Text>
      <Text testID='verify.tokenCache.user'>{`user: ${isLoaded ? (user?.id ?? 'none') : 'loading'}`}</Text>
    </View>
  );
}
