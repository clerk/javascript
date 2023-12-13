import { OrganizationProfile } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const OrganizationProfilePage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <OrganizationProfile path='/organization' />
    </div>
  );
};

export default OrganizationProfilePage;
