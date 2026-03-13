'use client';
import { useUser } from '@clerk/nextjs';

export default function UseUserPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  return (
    <div>
      <h1>useUser Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='is-signed-in'>{String(isSignedIn)}</div>
      <div data-testid='user-id'>{String(user?.id)}</div>
      <div data-testid='user-email'>{String(user?.primaryEmailAddress?.emailAddress)}</div>
      <div data-testid='user-first-name'>{String(user?.firstName)}</div>
      <div data-testid='user-last-name'>{String(user?.lastName)}</div>
    </div>
  );
}
