'use client';
import { useClerk } from '@clerk/nextjs';

export default function UseClerkPage() {
  const clerk = useClerk();
  return (
    <div>
      <h1>useClerk Hook</h1>
      <div data-testid='loaded'>{String(!!clerk.loaded)}</div>
      <div data-testid='user-id'>{String(clerk.user?.id)}</div>
      <div data-testid='session-id'>{String(clerk.session?.id)}</div>
    </div>
  );
}
