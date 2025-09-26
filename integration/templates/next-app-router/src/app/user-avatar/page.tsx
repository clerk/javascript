import { UserAvatar } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <UserAvatar fallback={<>Loading user avatar</>} />
    </div>
  );
}
