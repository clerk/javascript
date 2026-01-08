import { Show, UserProfile } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import type { GetServerSideProps, NextPage } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId } = getAuth(req);
  console.log(userId);
  return { props: { message: 'hello from server' } };
};

const UserProfilePage: NextPage = (props: any) => {
  return (
    <div>
      <h2>/pages/user</h2>
      <pre>{props.message}</pre>
      <Show when='signed-in'>
        <h2>SignedIn</h2>
      </Show>
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;