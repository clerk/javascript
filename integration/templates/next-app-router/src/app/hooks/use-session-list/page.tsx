'use client';
import { useSessionList } from '@clerk/nextjs';

export default function UseSessionListPage() {
  const { isLoaded, sessions } = useSessionList();
  return (
    <div>
      <h1>useSessionList Hook</h1>
      <div data-testid='is-loaded'>{String(isLoaded)}</div>
      <div data-testid='sessions-count'>{String(sessions?.length)}</div>
      <div data-testid='first-session-id'>{String(sessions?.[0]?.id)}</div>
    </div>
  );
}
