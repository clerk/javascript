import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className='relative isolate rounded border bg-white bg-gradient-to-b from-white to-neutral-50 px-2.5 py-1 text-sm font-medium'>
      {children}
    </button>
  );
}

export default function Home() {
  return (
    <div className='relative'>
      <SignedIn>
        <SignOutButton>
          <Button>Sign out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <div className='flex flex-col gap-4'>
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  );
}
