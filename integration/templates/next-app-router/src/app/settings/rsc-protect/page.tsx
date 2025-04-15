import { Protect } from '@clerk/nextjs';

export default function Page() {
  return (
    <Protect
      role='org:admin'
      fallback={<p>User is not admin</p>}
    >
      <p>User has access</p>
    </Protect>
  );
}
