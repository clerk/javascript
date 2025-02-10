import { OrganizationList } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const Discover: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <OrganizationList
        afterSelectPersonalUrl='/user/:id'
        afterSelectOrganizationUrl='/organization/:id'
      />
    </div>
  );
};

export default Discover;
