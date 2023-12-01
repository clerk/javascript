import React from 'react';
import { Routes, Route, MemoryRouter, useNavigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  useAuth,
  useUser,
  ClerkProvider,
} from "@clerk/chrome-extension";

import "./index.css";

function HelloUser() {
  const { isSignedIn, user } = useUser();
  const { getToken, signOut } = useAuth();

  const [sessionToken, setSessionToken] = React.useState("");

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div>
      <p>Hi, {user.primaryEmailAddress?.emailAddress}!</p>
      <p>Clerk Session Token: {sessionToken}</p>
      <p>
        <button onClick={() => signOut()}>Sign out</button>
      </p>
    </div>
  );
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
      syncSessionWithTab
    >
      <div className="App">
        <header className="App-header">
          <p>Welcome to Clerk Chrome Extension Starter!</p>
          <a
            className="App-link"
            href="https://clerk.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Clerk
          </a>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/sign-up/*" element={<SignUp signInUrl="/" />} />
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <HelloUser />
                  </SignedIn>
                  <SignedOut>
                    <SignIn afterSignInUrl="/" signUpUrl="/sign-up" />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </ClerkProvider>
  );
}

function App() {
  return (
    <MemoryRouter>
      <ClerkProviderWithRoutes />
    </MemoryRouter>
  );
}

export default App;


// export default function Popup(): JSX.Element {
//   return (
//     <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
//       <header className="flex flex-col items-center justify-center text-white">
//         <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
//         <p>
//           Edit <code>src/pages/popup/Popup.jsx</code> and save to reload.
//         </p>
//         <a
//           className="text-blue-400"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React!
//         </a>
//         <p>Popup styled with TailwindCSS!</p>
//       </header>
//     </div>
//   );
// }



