import { UserProfile } from '@clerk/nextjs';
import type { GetServerSideProps, NextPage } from 'next';
import React from 'react';
import { getAuth } from '@clerk/nextjs/server';

export const getServerSideProps: GetServerSideProps = async context => {
  const auth = getAuth(context.req);
  console.log('getServerSideProps', auth.userId);
  return { props: {} };
};

const UserProfilePage: NextPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <UserProfile path='/user' />
    </div>
  );
};

export default UserProfilePage;
