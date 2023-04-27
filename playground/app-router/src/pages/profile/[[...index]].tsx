import { UserProfile } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const UserProfilePage: NextPage = (props: any) => {
  return (
    <div>
      <h2>/pages/profile</h2>
      <h2>experimental-edge</h2>
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;

export const config = {
  runtime: 'experimental-edge',
};
