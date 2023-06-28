import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import clerkLogo from '/clerk.svg';
import './App.css';
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  useUser,
} from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;

function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <a href='/'>Home</a>
        </li>
        <li>
          <a href='/protected'>Protected</a>
        </li>
        <li>
          <a href='/sign-in'>Sign In</a>
        </li>
        <li>
          <a href='/sign-up'>Sign Up</a>
        </li>
        <li>
          <a href='/user'>User Profile</a>
        </li>
      </ul>
      <UserButton afterSignOutUrl='/' />
    </nav>
  );
}

function PublicPage() {
  return (
    <>
      <h1>Home</h1>
      <a href='/protected'>Go to protected page</a>
    </>
  );
}

function ProtectedPage() {
  const { user } = useUser();
  return (
    <>
      <h1>Protected page</h1>
      <p>Hello, {user?.fullName || user?.username || user?.emailAddresses?.[0].emailAddress}</p>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      navigate={to => navigate(to)}
    >
      <div>
        <a href='#'>
          <img
            src={clerkLogo}
            className='clerk logo'
            alt='Clerk logo'
          />
        </a>
        <a href='#'>
          <img
            src={reactLogo}
            className='logo react'
            alt='React logo'
          />
        </a>
        <a href='#'>
          <img
            src={viteLogo}
            className='logo'
            alt='Vite logo'
          />
        </a>
      </div>
      <h1>Clerk + React + Vite</h1>
      <NavBar />
      <Routes>
        <Route
          path='/'
          element={<PublicPage />}
        />
        <Route
          path='/sign-in/*'
          element={
            <SignIn
              routing='path'
              path='/sign-in'
            />
          }
        />
        <Route
          path='/sign-up/*'
          element={
            <SignUp
              routing='path'
              path='/sign-up'
            />
          }
        />
        <Route
          path='/user/*'
          element={<UserProfile />}
        />
        <Route
          path='/protected'
          element={
            <>
              <SignedIn>
                <ProtectedPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  );
}

export default App;
