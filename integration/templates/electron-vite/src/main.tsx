import { ClerkProvider, Show, SignIn, UserButton, useAuth, useClerk, useSessionList } from '@clerk/electron/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './style.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={() => {}}
      routerReplace={() => {}}
    >
      <main data-testid='electron-app'>
        <NativeSessionActivator />
        <Show when='signed-out'>
          <SignIn />
        </Show>
        <Show when='signed-in'>
          <UserButton />
          <AuthInfo />
        </Show>
      </main>
    </ClerkProvider>
  );
}

function NativeSessionActivator() {
  const clerk = useClerk();
  const { sessionId } = useAuth();
  const { isLoaded, sessions } = useSessionList();
  const activatingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isLoaded || sessionId || !sessions.length || activatingRef.current) {
      return;
    }

    activatingRef.current = true;
    void clerk.setActive({ session: sessions[0].id }).finally(() => {
      activatingRef.current = false;
    });
  }, [clerk, isLoaded, sessionId, sessions]);

  return null;
}

function AuthInfo() {
  const { sessionId, userId } = useAuth();

  return (
    <div>
      <p data-testid='user-id'>{userId}</p>
      <p data-testid='session-id'>{sessionId}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
