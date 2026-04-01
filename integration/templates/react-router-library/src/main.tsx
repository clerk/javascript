import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ClerkProvider } from '@clerk/react-router';
import './index.css';
import App from './App.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_JS_URL = import.meta.env.VITE_CLERK_JS_URL;
const CLERK_UI_URL = import.meta.env.VITE_CLERK_UI_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        __internal_clerkJSUrl={CLERK_JS_URL}
        __internal_clerkUIUrl={CLERK_UI_URL}
        appearance={{
          options: {
            showOptionalFields: true,
          },
        }}
      >
        <Routes>
          <Route
            path='/'
            element={<App />}
          />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
);
