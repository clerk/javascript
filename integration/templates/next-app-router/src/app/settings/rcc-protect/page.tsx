'use client';
import { Protect } from '@clerk/nextjs';

export default function Page() {
  return (
    <Protect
      permission='org:posts:manage'
      /* @ts-ignore Need to take a look at the TS files, might be a types/react version thing */
      fallback={<p>User is missing permissions</p>}
    >
      <p>User has access</p>
    </Protect>
  );
}
