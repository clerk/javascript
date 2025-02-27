import { OrganizationSwitcher, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import React from 'react';
import { ClientId } from './client-id';

function App() {
  return (
    <main>
      <UserButton afterSignOutUrl={'/'} />
      <OrganizationSwitcher fallback={<>Loading organization switcher</>} />
      <ClientId />
      <SignedOut>SignedOut</SignedOut>
      <SignedIn>SignedIn</SignedIn>
      <Link href='/protected'>Protected</Link>
    </main>
  );
}

export default App;
