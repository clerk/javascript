import { SignOutButton } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <p data-testid='page-name'>sign-out</p>
      <SignOutButton redirectUrl='/transitive-state/sign-out/sign-in' />
    </div>
  );
}
