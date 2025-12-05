import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ClerkProvider } from '@clerk/react-router';
import './index.css';
import App from './App.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          layout: {
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
