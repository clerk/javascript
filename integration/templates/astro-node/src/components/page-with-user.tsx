import React, { type PropsWithChildren, useSyncExternalStore } from 'react';
import { UserProfile } from '@clerk/astro/client/react';
import { $userStore } from '@clerk/astro/client/stores';

export function PageWithUser({ children }: PropsWithChildren) {
  const user = useSyncExternalStore($userStore.listen, $userStore.get, $userStore.get);

  return (
    <>
      <p>My name is: {user?.firstName}</p>
      <div className='flex w-full justify-center'>
        <UserProfile />
      </div>
      {children}
    </>
  );
}
