'use client';
import { Show } from '@clerk/nextjs';

export default function Page() {
  return (
    <Show
      fallback={<p>User is missing permissions</p>}
      when={{ permission: 'org:posts:manage' }}
    >
      <p>User has access</p>
    </Show>
  );
}
