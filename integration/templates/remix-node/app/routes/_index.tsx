import type { V2_MetaFunction } from '@remix-run/node';
import { SignedIn, SignedOut, UserButton } from '@clerk/remix';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  return (
    <div>
      <UserButton />
      <SignedIn>SignedIn</SignedIn>
      <SignedOut>SignedOut</SignedOut>
    </div>
  );
}
