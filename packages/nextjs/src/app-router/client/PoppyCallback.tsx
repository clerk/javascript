'use client';

import { useSignIn } from '@clerk/react/legacy';
import React, { useEffect, useRef, useState } from 'react';

export function PoppyCallback({ ticket, redirectTo }: { ticket: string; redirectTo: string }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const hasRun = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded || hasRun.current) {
      return;
    }
    hasRun.current = true;
    void (async () => {
      try {
        const result = await signIn.create({ strategy: 'ticket', ticket });
        if (result.status !== 'complete' || !result.createdSessionId) {
          setFailed(true);
          return;
        }
        await setActive({ session: result.createdSessionId, redirectUrl: redirectTo });
      } catch {
        setFailed(true);
      }
    })();
  }, [isLoaded, signIn, setActive, ticket, redirectTo]);

  return <p>{failed ? 'Start the browser connection again.' : 'Connecting this browser.'}</p>;
}
