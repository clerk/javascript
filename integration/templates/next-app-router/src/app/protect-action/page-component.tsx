'use client';
import { useState, useTransition } from 'react';

export function PageComponent({ action }: { action: () => Promise<any> }) {
  const [pending, startTransition] = useTransition();
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await action().then(setRes);
          });
        }}
      >
        LogUserId
      </button>
      <pre>{JSON.stringify(res)}</pre>
    </>
  );
}
