import { Stack, useRouter } from 'expo-router';
import { ClerkLoaded, ClerkProvider } from '@clerk/expo';

export default function RootLayout() {
  const router = useRouter();

  return (
    <ClerkProvider
      routerPush={(to: string) => router.push(to)}
      routerReplace={to => router.replace(to)}
      clerkJSUrl={process.env.EXPO_PUBLIC_CLERK_JS_URL}
      clerkUiUrl={process.env.EXPO_PUBLIC_CLERK_UI_URL}
      appearance={{
        options: {
          showOptionalFields: true,
        },
      }}
    >
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name='index' />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
