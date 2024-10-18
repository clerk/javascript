import { useState } from 'react';

export function PageComponent({ url }: { url: string }) {
  const [res, setRes] = useState(null);

  return (
    <>
      <button
        onClick={async () => {
          await fetch(url, {
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
