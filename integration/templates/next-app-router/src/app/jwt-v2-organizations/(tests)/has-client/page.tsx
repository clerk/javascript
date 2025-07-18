'use client';
import { useAuth } from '@clerk/nextjs';
import { Conditionals } from '../conditionals';

export default function Page() {
  const { has, orgRole } = useAuth();

  if (!has) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Has Client</h1>
      <Conditionals
        hasImpersonationRead={has({ permission: 'org:impersonation:read' })}
        hasMagicLinksCreate={has({ permission: 'org:magic_links:create' })}
        hasMagicLinksRead={has({ permission: 'org:magic_links:read' })}
        hasImpersonationManage={has({ permission: 'org:impersonation:manage' })}
        hasAdminRole={has({ role: 'org:admin' })}
        hasManagerRole={has({ role: 'org:manager' })}
        hasImpersonationReaderRole={has({ role: 'org:impersonation_reader' })}
        role={orgRole}
        hasImpersonationFeature={has({ feature: 'org:impersonation' })}
        hasMagicLinksFeature={has({ feature: 'org:magic_links' })}
        hasMagicLinksCreateUnscoped={has({ permission: 'magic_links:create' })}
        hasImpersonationReaderRoleUnscoped={has({ role: 'impersonation_reader' })}
      />
    </>
  );
}
