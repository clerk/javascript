'use client';
import { Protect } from '@clerk/nextjs';
export default function Page() {
  return (
    <Protect
      permission='org:posts:manage'
      fallback={<p>User is missing permissions</p>}
    >
      <p>User has access</p>
    </Protect>
  );
}
