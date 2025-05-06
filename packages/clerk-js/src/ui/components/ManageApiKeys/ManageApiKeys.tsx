import { useClerk } from '@clerk/shared/react';
import type { ApiKeyResource } from '@clerk/types';
import { useEffect, useState } from 'react';

// import { useManageApiKeysContext } from '../../contexts';

export const ManageApiKeys = () => {
  const clerk = useClerk();
  // const ctx = useManageApiKeysContext();
  const [apiKeys, setApiKeys] = useState<ApiKeyResource[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string | null>>({});

  useEffect(() => {
    clerk.getApiKeys().then(apiKeys => {
      setApiKeys(apiKeys);
    });
  }, [clerk]);

  const toggleSecret = async (id: string) => {
    setRevealedKeys(prev => {
      if (prev[id]) {
        return { ...prev, [id]: null };
      }
      return prev;
    });

    if (!revealedKeys[id]) {
      const secret = await clerk.getApiKeySecret(id);
      setRevealedKeys(prev => ({ ...prev, [id]: secret }));
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px #0001',
        }}
      >
        <thead>
          <tr style={{ textAlign: 'left', fontSize: 13, color: '#888', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '12px 16px' }}>Name</th>
            <th style={{ padding: '12px 16px' }}>Last used</th>
            <th style={{ padding: '12px 16px' }}>Key</th>
            <th style={{ padding: '12px 16px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map(apiKey => (
            <tr
              key={apiKey.id}
              style={{ borderBottom: '1px solid #f3f3f3' }}
            >
              <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 500 }}>{apiKey.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  Created at{' '}
                  {apiKey.createdAt.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
              </td>
              <td style={{ padding: '12px 16px', verticalAlign: 'top', fontSize: 14, color: '#444' }}>
                {/* Placeholder for "Last used" */}
                3d ago
              </td>
              <td style={{ padding: '12px 16px', verticalAlign: 'top', fontFamily: 'monospace', fontSize: 16 }}>
                <input
                  type='text'
                  value={revealedKeys[apiKey.id] ?? '•••••••••••••'}
                  readOnly
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    letterSpacing: 2,
                    outline: 'none',
                    padding: 0,
                    color: '#222',
                    pointerEvents: 'none',
                  }}
                  aria-label='API key (hidden)'
                  tabIndex={-1}
                />
                <button
                  type='button'
                  style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                  title='Show key'
                  onClick={() => void toggleSecret(apiKey.id)}
                >
                  <span
                    role='img'
                    aria-label={revealedKeys[apiKey.id] ? 'Hide' : 'Show'}
                  >
                    {revealedKeys[apiKey.id] ? '🙈' : '👁️'}
                  </span>
                </button>
                <button
                  type='button'
                  style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                  title='Copy key'
                >
                  <span
                    role='img'
                    aria-label='Copy'
                  >
                    📋
                  </span>
                </button>
              </td>
              <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                <button
                  type='button'
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  title='More actions'
                >
                  <span
                    role='img'
                    aria-label='More'
                  >
                    ⋯
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
