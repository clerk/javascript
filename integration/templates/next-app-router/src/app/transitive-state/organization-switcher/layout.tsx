'use client';

import { OrganizationSwitcher, useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

function EmissionLog() {
  const { orgId } = useAuth();
  const pathname = usePathname();
  const [log, setLog] = useState<string[]>([]);

  const entry = `${pathname} - ${orgId}`;
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
        <OrganizationSwitcher
          fallback={<div>Loading organization switcher</div>}
          afterSelectOrganizationUrl='/transitive-state/organization-switcher/:id'
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Emission log</h2>
        <EmissionLog />
      </div>
      {children}
    </div>
  );
}
