'use client';
import { useState, useTransition } from 'react';
import { __experimental_useReverification as useReverification } from '@clerk/nextjs';
import { logUserIdActionReverification } from '@/app/(reverification)/actions';

function Page() {
  const { handleReverification } = useReverification();
  const [pending, startTransition] = useTransition();
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          const fetcher = handleReverification(logUserIdActionReverification);
          startTransition(async () => {
            await fetcher().then(e => {
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
