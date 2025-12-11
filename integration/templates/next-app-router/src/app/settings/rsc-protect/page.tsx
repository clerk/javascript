import { Protect } from '@clerk/nextjs';

export default function Page() {
  return (
    <Protect
      fallback={<p>User is not admin</p>}
      role='org:admin'
    >
      <p>User has access</p>
    </Protect>
  );
}
