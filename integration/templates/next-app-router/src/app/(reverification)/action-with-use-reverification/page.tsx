'use client';
import { useState, useTransition } from 'react';
import { __experimental_useReverification as useReverification } from '@clerk/nextjs';
import { logUserIdActionReverification } from '@/app/(reverification)/actions';

function Page() {
  const [logUserWithReverification] = useReverification(logUserIdActionReverification);
  const [pending, startTransition] = useTransition();
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await logUserWithReverification().then(e => {
              setRes(e as any);
            });
          });
        }}
      >
        LogUserId
      </button>
      <pre>{JSON.stringify(res)}</pre>
    </>
  );
}

export default Page;
