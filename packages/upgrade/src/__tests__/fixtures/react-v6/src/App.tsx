import { ClerkProvider, useUser } from '@clerk/react';

export default function App() {
  return (
    <ClerkProvider publishableKey='pk_test_xxx'>
      <UserInfo />
    </ClerkProvider>
  );
}

function UserInfo() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user?.firstName}</div>;
}
