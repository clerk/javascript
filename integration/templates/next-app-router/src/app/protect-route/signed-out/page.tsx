'use client';
import { useState } from 'react';

function Page() {
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        onClick={async () => {
          await fetch('/api/log-user-id', {
            method: 'POST',
          })
            .then(res => res.json())
            .then(setRes);
        }}
      >
        LogUserId
      </button>
      <pre>{JSON.stringify(res)}</pre>
    </>
  );
}

export default Page;
