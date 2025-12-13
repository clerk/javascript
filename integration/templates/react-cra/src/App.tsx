// @ts-ignore
import React from 'react';
import './App.css';
import { Show, SignIn, UserButton } from '@clerk/react';

function App() {
  return (
    <main>
      <Show when='signedOut'>
        <SignIn />
      </Show>
      <Show when='signedIn'>Signed In</Show>
      <UserButton />
    </main>
  );
}

export default App;
