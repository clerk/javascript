'use client';

import { useClerk, useOrganization } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function RoleSelector() {
  const { setActive, isSignedIn } = useClerk();
  const { organization, membership, memberships } = useOrganization({
    memberships: true,
  });
  const [roles, setRoles] = useState<
    // @ts-expect-error don't worry atm
    Awaited<ReturnType<typeof organization.getRoles>>
  >(
    // @ts-expect-error don't worry atm
    {},
  );

  const [checked, setChecked] = useState(true);

  useEffect(() => {
    void organization?.getRoles().then(roles => {
      setRoles(roles);
    });
  }, [organization?.id]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className='rounded-md bg-amber-500 p-2 shadow-md'>
      <p>Change role:</p>

      <fieldset>
        <label>Refresh router</label>
        <input
          type='checkbox'
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
        />
      </fieldset>
      {checked}

      <select
        value={membership?.role}
        disabled={!membership}
        onChange={async e => {
          e.preventDefault();

          const value = e.target.value;

          await memberships?.data
            ?.find(m => m.id === membership?.id)
            ?.update({
              role: value,
            });

          if (checked) {
            setActive({
              organization: organization?.id,
            });
          }
        }}
      >
        {roles.data?.map(role => (
          <option
            key={role.id}
            value={role.key}
          >
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}
