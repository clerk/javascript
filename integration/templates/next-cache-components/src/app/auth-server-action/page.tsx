'use client';

import { useState } from 'react';
import { checkAuthAction } from './actions';

export default function AuthServerActionPage() {
  const [result, setResult] = useState<{ userId: string | null; sessionId: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    try {
      const authResult = await checkAuthAction();
      setResult(authResult);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setResult(null);
    }
  }

  return (
    <main>
      <h1>auth() in Server Action</h1>
      <p>This page tests using auth() inside a server action.</p>

      <button
        onClick={handleCheck}
        data-testid='check-auth-btn'
      >
        Check Auth via Server Action
      </button>

      {result && (
        <div className='test-result success'>
          <h3>Auth Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <div data-testid='action-user-id'>{result.userId ?? 'Not signed in'}</div>
        </div>
      )}

      {error && (
        <div className='test-result error'>
          <h3>Error:</h3>
          <pre data-testid='action-error'>{error}</pre>
        </div>
      )}
    </main>
  );
}
