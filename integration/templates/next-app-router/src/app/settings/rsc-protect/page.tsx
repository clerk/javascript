import { Show } from '@clerk/nextjs';

export default function Page() {
  return (
    <Show
      fallback={<p>User is not admin</p>}
      when={{ role: 'org:admin' }}
    >
      <p>User has access</p>
    </Show>
  );
}
