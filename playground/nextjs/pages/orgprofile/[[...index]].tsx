import { UnstableOrganizationProfile } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const UserProfilePage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <UnstableOrganizationProfile />
    </div>
  );
};

export default UserProfilePage;
