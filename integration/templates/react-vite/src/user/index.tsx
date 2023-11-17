import { UserProfile } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <UserProfile
        path={'/user'}
      />
    </div>
  );
}
