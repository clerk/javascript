'use client';

import { CreateOrganization, useOrganizationList } from '@clerk/nextjs';

export default function Page() {
  const { userMemberships } = useOrganizationList({ userMemberships: true });
  return (
    <>
      <CreateOrganization routing='hash' />

      <ul>
        {userMemberships?.data?.map(mem => (
          <li
            key={mem.id}
            data-name={mem.organization.name}
          >
            {mem.organization.name}
            <button
              data-name={mem.organization.name}
              onClick={() => mem.destroy()}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
