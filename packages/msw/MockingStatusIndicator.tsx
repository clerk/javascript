'use client';

import { useMockingContext } from './MockingProvider';

export function MockingStatusIndicator() {
  const { error, isEnabled } = useMockingContext();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const dotColor = error ? '#ef4444' : isEnabled ? '#22c55e' : '#9ca3af';

  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        bottom: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'inline-flex',
        gap: '6px',
        paddingBottom: '6px',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '6px',
        pointerEvents: 'none',
        position: 'fixed',
        right: '16px',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: dotColor,
          borderRadius: '9999px',
          height: '6px',
          width: '6px',
        }}
      />
      <span style={{ color: '#4b5563', fontSize: '12px', lineHeight: '16px' }}>
        {error ? 'Error' : isEnabled ? 'Mocked' : 'Live'}
      </span>
    </div>
  );
}
