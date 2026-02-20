'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

function EmissionLog() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [log, setLog] = useState<string[]>([]);

  const entry = `${pathname} - ${String(userId)}`;
  if (entry !== log[log.length - 1]) {
    setLog(prev => [...prev, entry]);
  }

  return (
    <ul data-testid='emission-log'>
      {log.map((entry, i) => (
        <li
          key={i}
          data-testid={`emission-${i}`}
        >
          {entry}
        </li>
      ))}
    </ul>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: '40px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Emission log</h2>
        <EmissionLog />
      </div>
      {children}
    </div>
  );
}
