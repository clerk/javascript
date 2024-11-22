import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/chrome-extension';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;

if (!PUBLISHABLE_KEY) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file');
}

if (!SYNC_HOST) {
  console.warn('Initialized without PLASMO_PUBLIC_CLERK_SYNC_HOST');
}

export const RootLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('location', location);
  return (
    <ClerkProvider
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl='/'
      syncHost={SYNC_HOST}
    >
      <div className='plasmo-w-[785px] plasmo-h-[600px] plasmo-flex plasmo-flex-col'>
        <main className='plasmo-grow plasmo-border-2 plasmo-border-red-500'>
          <Outlet />
        </main>
        <footer className='plasmo-border-2 plasmo-border-green-500'>
          <SignedIn>
            <Link to='/sdk-features'>SDK Features</Link>
            <Link to='/settings'>Settings</Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link to='/'>Home</Link>
            <Link to='/sign-in'>Sign In</Link>
            <Link to='/sign-up'>Sign Up</Link>
          </SignedOut>
        </footer>
      </div>
    </ClerkProvider>
  );
};
