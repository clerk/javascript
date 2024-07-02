import { Text, View } from 'react-native';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { UserButton } from '@clerk/clerk-expo/web';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SignedIn>
        Hello <UserButton />
      </SignedIn>
      <SignedOut>
        <Text>You are signed out</Text>
      </SignedOut>
    </View>
  );
}
