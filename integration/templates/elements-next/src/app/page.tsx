import React from 'react';
import { SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className='rounded-lg bg-white px-8 py-4'>
      <h2 className='text-lg font-medium tracking-tight'>{title}</h2>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <h1 className='text-2xl font-medium tracking-tight text-zinc-950'>Clerk Elements: Next.js E2E</h1>
      <p className='text-md mb-6 mt-2 text-zinc-500'>
        Kitchen sink template to test out Clerk Elements in Next.js App Router.
      </p>
      <div className='grid grid-cols-3 gap-4'>
        <Card title='State'>
          <SignedOut>
            <p className='code'>signed-out-state</p>
          </SignedOut>
          <SignedIn>
            <p className='code'>signed-in-state</p>
          </SignedIn>
        </Card>
        <Card title='Links'>
          <ul>
            <li>
              <Link
                href='/sign-in'
                prefetch={false}
                className='text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline'
              >
                Sign-In
              </Link>
            </li>
            <li>
              <Link
                href='/sign-up'
                className='text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline'
              >
                Sign-Up
              </Link>
            </li>
            <li>
              <Link
                href='/otp'
                className='text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline'
              >
                OTP Playground
              </Link>
            </li>
            <li>
              <Link
                href='/validate-password'
                className='text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline'
              >
                Password Validation
              </Link>
            </li>
          </ul>
        </Card>
        <Card title='Signed-in Actions'>
          <SignedOut>
            <p>Not logged in.</p>
          </SignedOut>
          <SignedIn>
            <SignOutButton redirectUrl='/'>
              <button>Sign Out</button>
            </SignOutButton>
          </SignedIn>
        </Card>
      </div>
    </main>
  );
}
