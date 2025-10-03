import { useUser } from '@clerk/react';

export function Protected() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) {
    return;
  }

  return (
    <div>
      <h1>Protected</h1>
      <p>{user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
