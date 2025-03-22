import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SignedIn, SignedOut, SignIn, SignOutButton, UserButton } from '@clerk/tanstack-react-start';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1>Index Route</h1>
      <SignedIn>
        <p>You are signed in!</p>
        <div>
          <p>View your profile here</p>
          <UserButton />
        </div>
        <div>
          <SignOutButton />
        </div>
      </SignedIn>
      <SignedOut>
        <p>You are signed out</p>

        <SignIn />
      </SignedOut>
    </div>
  );
}
