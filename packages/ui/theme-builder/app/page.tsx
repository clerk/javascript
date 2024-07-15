import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className='relative isolate inline-flex w-full shrink-0 select-none appearance-none items-center justify-center rounded-md border border-gray-800 bg-gray-800 px-2 py-1.5 text-sm font-medium text-white shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] outline-none ring-[0.1875rem] ring-transparent before:absolute before:inset-0 before:rounded-[calc(theme(borderRadius.md)-1px)] before:shadow-[0_1px_1px_0_theme(colors.white/.07)_inset] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.md)-1px)] after:bg-gradient-to-b after:from-white/10 after:to-transparent focus:ring-gray-200'>
      {children}
    </button>
  );
}

export default function Home() {
  return (
    <>
      <SignedIn>
        <SignOutButton>
          <Button>Sign out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <div className='flex gap-4'>
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </>
  );
}
