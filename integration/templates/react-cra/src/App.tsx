// @ts-ignore
import React from 'react';
import './App.css';
import { Show, SignIn, UserButton } from '@clerk/react';

function App() {
  return (
    <main>
      <Show when='signed-out'>
        <SignIn />
      </Show>
      <Show when='signed-in'>Signed In</Show>
      <UserButton />
    </main>
  );
}

export default App;
