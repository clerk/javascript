<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/external-data/page.tsx' }}
'use client';

import { useAuth } from '@clerk/nextjs';

export default function ExternalDataPage() {
  const { userId, sessionId, getToken, isLoaded, isSignedIn } = useAuth();

  const fetchExternalData = async () => {
    const token = await getToken();

    // Fetch data from an external API
    const response = await fetch('https://api.example.com/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  return (
    <div>
      <p>
        Hello, {userId}! Your current active session is {sessionId}.
      </p>
      <button onClick={fetchExternalData}>Fetch Data</button>
    </div>
  );
}
```

<!-- #endregion nextjs-01 -->
