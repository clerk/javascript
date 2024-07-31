import { Stack, useRouter } from 'expo-router';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';

export default function RootLayout() {
  const router = useRouter();

  return (
    <ClerkProvider
      routerPush={(to: string) => router.push(to)}
      routerReplace={to => router.replace(to)}
    >
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name='index' />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
