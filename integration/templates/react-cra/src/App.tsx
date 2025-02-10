// @ts-ignore
import React from 'react';
import './App.css';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <main>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>Signed In</SignedIn>
      <UserButton afterSignOutUrl={'/'} />
    </main>
  );
}

export default App;
