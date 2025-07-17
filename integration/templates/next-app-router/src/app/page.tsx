import { Protect, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/nextjs';
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
      <Protect plan='free_user'>
        <p>user in free</p>
      </Protect>
      <Protect plan='pro'>
        <p>user in pro</p>
      </Protect>
      <Protect plan='plus'>
        <p>user in plus</p>
      </Protect>
      <SignIn
        routing='hash'
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
