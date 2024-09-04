import { useClerk, useSession } from '@clerk/clerk-react';
import React from 'react';

export function ClientId() {
  const clerk = useClerk();
  // For re-rendering
  useSession();
  return (
    <>
      {clerk?.client?.id && <p data-clerk-id>{clerk?.client?.id}</p>}
      {clerk?.client?.lastActiveSessionId && <p data-clerk-session>{clerk?.client?.lastActiveSessionId}</p>}
    </>
  );
}
