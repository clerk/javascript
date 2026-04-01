'use client';

import React from 'react';
import { useAuth, useUser } from '@clerk/react';

export const ClientSideWrapper = (props: React.PropsWithChildren) => {
  React.useEffect(() => {});

  const useUserRes = useUser();
  const useAuthRes = useAuth();
  return (
    <div style={{ border: '2px dashed red', padding: '2rem', margin: '2rem' }}>
      <h3>"use client";</h3>
      <pre>
        useUser
        {JSON.stringify({ isLoaded: useUserRes.isLoaded, user: useUserRes.user?.id }, null, 2)}
        useAuth2
        {JSON.stringify({ isSignedIn: useAuthRes.isSignedIn, user: useAuthRes.userId }, null, 2)}
      </pre>
      <div style={{ border: '2px dashed blue', padding: '2rem', margin: '2rem' }}>
        <h3>children</h3>
        {props.children}
      </div>
    </div>
  );
};
