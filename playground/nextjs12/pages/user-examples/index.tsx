import type { NextPage } from 'next';
import React from 'react';
import { useUser } from '@clerk/nextjs';

function GreetingWithHook() {
  // Use the useUser hook to get the Clerk.user object
  // This hook causes a re-render on user changes
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    // You can handle the loading or signed state separately
    return null;
  }

  return <div>Hello, {user.firstName}!</div>;
}

const UserExamplesPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <GreetingWithHook />
    </div>
  );
};

export default UserExamplesPage;
