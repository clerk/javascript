import { OrganizationSwitcher, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import React from 'react';

function App() {
  return (
    <main>
      <UserButton afterSignOutUrl={'/'} />
      <OrganizationSwitcher />
      <SignedOut>SignedOut</SignedOut>
      <SignedIn>SignedIn</SignedIn>
    </main>
  );
}

export default App;
