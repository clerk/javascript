import * as Clerk from '@clerk/nextjs';
import type { ComponentType, ReactNode } from 'react';

type ShowProps = {
  children: ReactNode;
  when: 'signedIn' | 'signedOut';
};

const Show: ComponentType<ShowProps> =
  (Clerk as { Show?: ComponentType<ShowProps> }).Show ||
  (({ children, when }) => {
    const SignedIn = (Clerk as { SignedIn?: ComponentType<{ children: ReactNode }> }).SignedIn;
    const SignedOut = (Clerk as { SignedOut?: ComponentType<{ children: ReactNode }> }).SignedOut;

    if (when === 'signedIn' && SignedIn) {
      return <SignedIn>{children}</SignedIn>;
    }

    if (when === 'signedOut' && SignedOut) {
      return <SignedOut>{children}</SignedOut>;
    }

    return null;
  });

const SignInButton = (Clerk as { SignInButton: ComponentType }).SignInButton;
const SignUpButton = (Clerk as { SignUpButton: ComponentType }).SignUpButton;
const UserButton = (Clerk as { UserButton: ComponentType }).UserButton;

export default function Home() {
  return (
    <header>
      <Show when='signedOut'>
        <p>signed-out-state</p>
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when='signedIn'>
        <p>signed-in-state</p>
        <UserButton />
      </Show>
    </header>
  );
}
