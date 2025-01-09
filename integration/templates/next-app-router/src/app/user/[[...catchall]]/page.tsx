import { UserProfile } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <UserProfile fallback={<>Loading user profile</>} />
    </div>
  );
}
