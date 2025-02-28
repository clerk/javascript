import { SignedIn, SignedOut, SignIn, UserButton, Protect } from '@clerk/nextjs';
import Link from 'next/link';
import { ClientId } from './client-id';

export default function Home() {
  return (
    <main>
      <UserButton fallback={<>Loading user button</>} />
      <ClientId />
      <SignedIn>SignedIn</SignedIn>
      <SignedOut>SignedOut</SignedOut>
      <Protect fallback={'SignedOut from protect'}>SignedIn from protect</Protect>
      <SignIn
        path={'/'}
        signUpUrl={'/sign-up'}
      />
      <ul>
        <li>
          <Link href='/page-protected'>Page Protected</Link>
          <Link href='/protected'>Protected</Link>
        </li>
      </ul>
    </main>
  );
}
