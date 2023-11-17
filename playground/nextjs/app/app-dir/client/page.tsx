'use client';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <SignedIn>Hello In</SignedIn>
      <SignedOut>Hello Out</SignedOut>
    </div>
  );
}
