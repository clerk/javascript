import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import { ClerkProvider } from '@clerk/react';
import { Home } from './routes/Home';
import { SignIn } from './routes/SignIn';
import { SignUp } from './routes/SignUp';
import { Protected } from './routes/Protected';
import { Waitlist } from './routes/Waitlist';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          clerkJSUrl={import.meta.env.VITE_CLERK_JS_URL as string}
          clerkUiUrl={import.meta.env.VITE_CLERK_UI_URL as string}
          appearance={{
            options: {
              showOptionalFields: true,
            },
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route
                path='/'
                element={<Home />}
              />
              <Route
                path='/sign-in'
                element={<SignIn />}
              />
              <Route
                path='/sign-up'
                element={<SignUp />}
              />
              <Route
                path='/waitlist'
                element={<Waitlist />}
              />
              <Route
                path='/protected'
                element={<Protected />}
              />
            </Routes>
          </BrowserRouter>
        </ClerkProvider>
      </div>
    </div>
  </StrictMode>,
);
