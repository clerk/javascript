import { SignedIn } from '@clerk/clerk-react';

export default function Page() {
  return (
    <div>
      <SignedIn>Protected</SignedIn>
    </div>
  );
}
