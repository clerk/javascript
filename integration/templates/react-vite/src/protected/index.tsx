import { SignedIn } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <SignedIn>
        <div data-testid='protected'>Protected</div>
      </SignedIn>
    </div>
  );
}
