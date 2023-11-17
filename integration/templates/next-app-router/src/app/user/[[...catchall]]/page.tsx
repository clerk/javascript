import { UserProfile } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <UserProfile
        path={'/user'}
      />
    </div>
  );
}
