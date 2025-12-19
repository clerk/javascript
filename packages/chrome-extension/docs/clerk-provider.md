# Clerk Provider Usage

## Core App

```tsx
// App.tsx
import { Show, SignInButton, UserButton } from '@clerk/chrome-extension';

function App() {
  return (
    <>
      <header>
        <Show when='signed-out'>
          <SignInButton mode='modal' />
        </Show>
        <Show when='signed-in'>
          <UserButton />
        </Show>
      </header>
      <main>
        <Show when='signed-out'>Please Sign In</Show>
        <Show when='signed-in'>Welcome!</Show>
      </main>
    </>
  );
}

export default App;
```

## Provider

Though not required, we generally suggest using Plasmo for browser extension development.
This will enforce common standards across your extension as well as allow for easier integration with other browsers in the future.

```tsx
// IndexPopup.tsx
import { ClerkProvider } from '@clerk/chrome-extension';
import App from './App';

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY; // REQUIRED
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST; // OPTIONAL

function IndexPopup() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      /* OPTIONAL: If syncHost is set, the extension will attempt to grab credentials from the host provided */
      syncHost={SYNC_HOST}
    >
      <App />
    </ClerkProvider>
  );
}

export default IndexPopup;
```

## Routing

You can hook into the router of your choice to handle navigation. Here's an example using `react-router-dom`:

```tsx
import { ClerkProvider, Show, SignIn, SignUp } from '@clerk/chrome-extension';
import { useNavigate, Routes, Route, MemoryRouter } from 'react-router-dom';
import App from './App';

const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppWithRouting() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path='/sign-up/*'
        element={<SignUp signInUrl='/' />}
      />
      <Route
        path='/'
        element={
          <>
            <Show when='signed-in'>Welcome User!</Show>
            <Show when='signed-out'>
              <SignIn
                forceRedirectUrl='/'
                signUpUrl='/sign-up'
              />
            </Show>
          </>
        }
      />
    </Routes>
  );
}

function IndexPopupWithRouting() {
  const navigate = useNavigate();

  return (
    <MemoryRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        routerPush={to => navigate(to)}
        routerReplace={to => navigate(to, { replace: true })}
      >
        <AppWithRouting />
      </ClerkProvider>
    </MemoryRouter>
  );
}

export default IndexPopupWithRouting;
```
