import { SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1 className='mb-4'>Clerk Elements: Next.js E2E</h1>
      <p className='mb-4'>Kitchen sink template to test out Clerk Elements in Next.js App Router.</p>
      <div className='grid'>
        <div className='card'>
          <h2>State:</h2>
          <SignedOut>
            <p className='code'>signed-out-state</p>
          </SignedOut>
          <SignedIn>
            <p className='code'>signed-in-state</p>
          </SignedIn>
        </div>
        <div className='card'>
          <h2>Links:</h2>
          <ul>
            <li>
              <Link
                href='/sign-in'
                prefetch={false}
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link href='/sign-up'>Sign Up</Link>
            </li>
            <li>
              <Link href='/otp'>OTP Playground</Link>
            </li>
          </ul>
        </div>
        <div className='card'>
          <h2>Signed In Actions:</h2>
          <SignedOut>
            <p>Not logged in.</p>
          </SignedOut>
          <SignedIn>
            <UserButton />
            <SignOutButton redirectUrl='/'>
              <p>Sign Out</p>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </main>
  );
}
