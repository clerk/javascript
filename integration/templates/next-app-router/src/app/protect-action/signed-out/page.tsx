'use client';
import { useState, useTransition } from 'react';
import { logUserIdAction } from '@/app/protect-action/actions';

function Page() {
  const [pending, startTransition] = useTransition();
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await logUserIdAction().then(setRes);
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
