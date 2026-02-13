import { UserButton } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <UserButton fallback={<>Loading user button</>} />
    </div>
  );
}
