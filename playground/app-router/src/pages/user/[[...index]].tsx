import { SignedIn, UserProfile } from '@clerk/nextjs';
import type { GetServerSideProps, NextPage } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async () => {
  // console.log(auth());
  return { props: { message: 'hello from server' } };
};

const UserProfilePage: NextPage = (props: any) => {
  return (
    <div>
      <h2>/pages/user</h2>
      <pre>{props.message}</pre>
      <SignedIn>
        <h2>SignedIn</h2>
      </SignedIn>
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;
