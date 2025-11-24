// @ts-ignore
import React from 'react';
import './App.css';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/react';

function App() {
  return (
    <main>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>Signed In</SignedIn>
      <UserButton />
    </main>
  );
}

export default App;
