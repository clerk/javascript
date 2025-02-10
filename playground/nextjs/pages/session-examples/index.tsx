import { useSession } from '@clerk/nextjs';
import { PublicUserData } from '@clerk/types';
import type { NextPage } from 'next';
import React from 'react';

function Template({ publicUserData }: { publicUserData: PublicUserData | undefined }) {
  return (
    <div>
      <h3>Public Metadata</h3>
      <pre>{JSON.stringify(publicUserData, null, 4)}</pre>
    </div>
  );
}

function PublicMetadataWithHook() {
  // Use the useUser hook to get the Clerk.user object
  // This hook causes a re-render on user changes
  const { session } = useSession();

  return <Template publicUserData={session?.publicUserData} />;
}

const SessionExamplesPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <PublicMetadataWithHook />
    </div>
  );
};

export default SessionExamplesPage;
