import { Show } from '@clerk/expo';
import { UserButton } from '@clerk/expo/web';
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Show when='signedIn'>
        <Text>You are signed in!</Text>
        <UserButton />
      </Show>
      <Show when='signedOut'>
        <Text>You are signed out</Text>
      </Show>
    </View>
  );
}
