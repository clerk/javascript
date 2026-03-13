'use client';
import { useSession } from '@clerk/nextjs';

export default function UseSessionPage() {
  const { isLoaded, isSignedIn, session } = useSession();
  return (
    <div>
      <h1>useSession Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='is-signed-in'>{String(isSignedIn)}</div>
      <div data-testid='session-id'>{String(session?.id)}</div>
      <div data-testid='session-status'>{String(session?.status)}</div>
    </div>
  );
}
