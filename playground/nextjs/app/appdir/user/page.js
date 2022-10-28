import { UserButton, UserProfile } from '@clerk/nextjs/app-beta';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'center' }}>
        <Link href='/appdir'>Home</Link>
        <UserButton afterSignOutUrl='/appdir' />
      </div>
      <UserProfile />
    </>
  );
}
