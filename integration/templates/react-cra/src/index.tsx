import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY as string}
      clerkJSUrl={process.env.REACT_APP_CLERK_JS as string}
      clerkUiUrl={process.env.REACT_APP_CLERK_UI as string}
      appearance={{
        options: {
          showOptionalFields: true,
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
