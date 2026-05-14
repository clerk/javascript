'use client';

import { useOrganizationList } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function OrgListLoadingStatePage() {
  const { isLoaded, userMemberships } = useOrganizationList({ userMemberships: true });
  const logRef = useRef<Array<{ isLoaded: boolean; dataLength: number | null; isLoading: boolean }>>([]);

  const dataLength = Array.isArray(userMemberships.data) ? userMemberships.data.length : null;
  const isLoading = userMemberships.isLoading;

  const entry = { isLoaded, dataLength, isLoading };
  const prev = logRef.current[logRef.current.length - 1];
  if (
    !prev ||
    prev.isLoaded !== entry.isLoaded ||
    prev.dataLength !== entry.dataLength ||
    prev.isLoading !== entry.isLoading
  ) {
    logRef.current.push(entry);
  }

  const hasBuggyState = logRef.current.some(s => s.isLoaded && s.dataLength === 0);
  const settled = isLoaded && !isLoading && dataLength !== null && dataLength > 0;

  return (
    <div style={{ fontFamily: 'monospace', padding: 20 }}>
      <h2>useOrganizationList loading state debugger</h2>

      <div data-testid='current-state'>
        <div>
          isLoaded: <span data-testid='is-loaded'>{String(isLoaded)}</span>
        </div>
        <div>
          memberships.isLoading: <span data-testid='is-loading'>{String(isLoading)}</span>
        </div>
        <div>
          memberships.data.length:{' '}
          <span data-testid='data-length'>{dataLength === null ? 'null' : String(dataLength)}</span>
        </div>
      </div>

      <div
        data-testid='has-buggy-state'
        style={{ marginTop: 16, padding: 8, background: hasBuggyState ? '#fee' : '#efe' }}
      >
        {hasBuggyState
          ? 'BUG DETECTED: isLoaded=true with data=[] observed'
          : settled
            ? 'OK: no empty-data flash detected'
            : 'Waiting for data...'}
      </div>

      <h3 style={{ marginTop: 16 }}>State log (each distinct render):</h3>
      <ol data-testid='state-log'>
        {logRef.current.map((s, i) => (
          <li
            key={i}
            data-buggy={s.isLoaded && s.dataLength === 0 ? 'true' : 'false'}
          >
            isLoaded={String(s.isLoaded)} data.length={s.dataLength === null ? 'null' : s.dataLength} isLoading=
            {String(s.isLoading)}
          </li>
        ))}
      </ol>
    </div>
  );
}
