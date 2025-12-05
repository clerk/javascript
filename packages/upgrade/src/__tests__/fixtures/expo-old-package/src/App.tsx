import { ClerkProvider, useAuth } from '@clerk/expo';

export default function App() {
  return (
    <ClerkProvider publishableKey='pk_test_xxx'>
      <AuthStatus />
    </ClerkProvider>
  );
}

function AuthStatus() {
  const { isSignedIn } = useAuth();
  return <Text>{isSignedIn ? 'Signed in' : 'Signed out'}</Text>;
}
