import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <Text>This screen doesn't exist.</Text>
      <Link href='/'>
        <Text>Go to home screen!</Text>
      </Link>
    </>
  );
}
