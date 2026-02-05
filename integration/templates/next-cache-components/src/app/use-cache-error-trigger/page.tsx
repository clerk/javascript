'use client';

import { useEffect, useState } from 'react';

export default function UseCacheErrorTriggerPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerError = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/use-cache-error-trigger');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    triggerError();
  }, []);

  return (
    <main>
      <h1>&quot;use cache&quot; Error Trigger</h1>
      <p>This page triggers an actual error by calling auth() inside a &quot;use cache&quot; function.</p>

      {loading && <div data-testid='loading'>Loading...</div>}

      {error && (
        <div
          className='test-result error'
          data-testid='error-message'
        >
          <h3>Error Caught:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
        </div>
      )}

      <button
        onClick={triggerError}
        data-testid='trigger-btn'
      >
        Trigger Error Again
      </button>
    </main>
  );
}
