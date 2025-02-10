import { SignedIn, SignedOut, UserButton } from '@clerk/react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}

export default function Home() {
  return (
    <div>
      <UserButton />
      <SignedIn>SignedIn</SignedIn>
      <SignedOut>SignedOut</SignedOut>
    </div>
  );
}
