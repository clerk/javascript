import { SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs';
import { cva } from 'cva';
import Link from 'next/link';

const button = cva({
  base: [
    'relative isolate',
    'text-sm text-center font-medium',
    'px-2.5 py-1',
    'border bg-white bg-gradient-to-b from-white to-neutral-50',
    'rounded',
  ],
});

export default function Home() {
  return (
    <div className='relative'>
      <SignedIn>
        <SignOutButton>
          <button className={button()}>Sign out</button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <div className='flex flex-col gap-4'>
          <Link
            href='/sign-in'
            className={button()}
          >
            Sign in
          </Link>

          <Link
            href='/sign-up'
            className={button()}
          >
            Sign up
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}
