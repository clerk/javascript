import { OrganizationProfile } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const UserProfilePage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <OrganizationProfile />
    </div>
  );
};

export default UserProfilePage;
