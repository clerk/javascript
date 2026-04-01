import { OrganizationSwitcher, Show, UserButton } from '@clerk/react';
import { Link } from 'react-router-dom';
import React from 'react';
import { ClientId } from './client-id';

function App() {
  return (
    <main>
      <UserButton />
      <OrganizationSwitcher fallback={<>Loading organization switcher</>} />
      <ClientId />
      <Show when='signed-out'>SignedOut</Show>
      <Show when='signed-in'>SignedIn</Show>
      <Link href='/protected'>Protected</Link>
    </main>
  );
}

export default App;
