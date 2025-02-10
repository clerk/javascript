import { Text, View } from 'react-native';
import { SignIn } from '@clerk/clerk-expo/web';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SignIn />
    </View>
  );
}
